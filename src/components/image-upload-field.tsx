"use client";

import { useRef, useState } from "react";

// Uploads straight from the browser to Cloudinary using an unsigned
// upload preset, then fills the (still editable) URL input.
export default function ImageUploadField({
  name,
  label,
  defaultValue,
  required,
  folder = "norfu",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  folder?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const configured = Boolean(cloud && preset);

  const upload = async (file: File) => {
    setStatus("uploading");
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", preset!);
    form.append("folder", folder);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
        { method: "POST", body: form }
      );
      const data = await res.json();
      if (!res.ok || !data.secure_url) throw new Error(data?.error?.message);
      setUrl(data.secure_url as string);
      setStatus("idle");
    } catch {
      setStatus("error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500"
      >
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={name}
          name={name}
          required={required}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://res.cloudinary.com/…"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
        />
        <button
          type="button"
          disabled={!configured || status === "uploading"}
          onClick={() => fileRef.current?.click()}
          title={
            configured
              ? "Upload an image to Cloudinary"
              : "Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to enable uploads"
          }
          className="shrink-0 rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:border-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "uploading" ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </div>
      {status === "error" && (
        <p className="mt-1 text-xs text-red-600">
          Upload failed — check the upload preset is unsigned, or paste a URL manually.
        </p>
      )}
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-3 h-32 rounded object-cover" />
      )}
    </div>
  );
}
