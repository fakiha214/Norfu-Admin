import ProductForm from "../product-form";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div>
      <h1 className="text-2xl font-bold">Add product</h1>
      <ProductForm error={error} />
    </div>
  );
}
