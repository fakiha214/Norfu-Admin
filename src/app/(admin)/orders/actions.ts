"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, productSizes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-server";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

// Cancelling puts reserved stock back on the shelf; un-cancelling
// takes it out again (stock never drops below zero).
async function adjustStockForOrder(orderId: number, direction: 1 | -1) {
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
  for (const item of items) {
    if (!item.productId) continue;
    await db
      .update(productSizes)
      .set({
        stock: sql`GREATEST(0, ${productSizes.stock} + ${direction * item.qty})`,
      })
      .where(
        and(
          eq(productSizes.productId, item.productId),
          eq(productSizes.size, item.size)
        )
      );
  }
}

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as Status;
  if (!id || !STATUSES.includes(status)) return;

  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  const order = rows[0];
  if (!order || order.status === status) return;

  if (status === "cancelled" && order.status !== "cancelled") {
    await adjustStockForOrder(id, 1);
  } else if (order.status === "cancelled" && status !== "cancelled") {
    await adjustStockForOrder(id, -1);
  }

  await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id));

  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
}

export async function setEmailSent(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const next = formData.get("next") === "true";
  if (id) {
    await db
      .update(orders)
      .set({ emailSent: next, updatedAt: new Date() })
      .where(eq(orders.id, id));
  }
  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
}
