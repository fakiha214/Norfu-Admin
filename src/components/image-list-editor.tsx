"use client";

import { useRef, useState } from "react";

// Manages up to `max` product image URLs. Each row uploads straight to
// Cloudinary (unsigned preset) or accepts a pasted URL. Submits the list via a
// hidden input, one URL per line — images[0] is the main image, images[1] the
// hover image, the rest are extra gallery shots.
export default function ImageListEditor({
  name,
  defaultImages,
  folder = "norfu",
  max = 8,
}: {
  name: string;
  defaultImages: string[];
  folder?: string;
  max?: number;
}) {
  const [images, setImages] = useState<string[]>(
    defaultImages.length > 0 ? defaultImages : [""]
  );

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const configured = Boolean(cloud && preset);

  const serialized = images.map((u) => u.trim()).filter(Boolean).join("\n");

  const setAt = (i: number, url: string) =>
    setImages((prev) => prev.map((u, j) => (j === i ? url : u)));
  const removeAt = (i: number) =>
    setImages((prev) => (prev.length === 1 ? [""] : prev.filter((_, j) => j !== i)));
  const addSlot = () =>
    setImages((prev) => (prev.length >= max ? prev : [...prev, ""]));

  const label = (i: number) =>
    i === 0 ? "Main image" : i === 1 ? "Hover image" : `Gallery image ${i - 1}`;

  return (
    <div>
      <input type="hidden" name={name} value={serialized} />

      <div className="space-y-3">
        {images.map((url, i) => (
          <ImageRow
            key={i}
            index={i}
            label={label(i)}
            url={url}
            configured={configured}
            cloud={cloud}
            preset={preset}
            folder={folder}
            onChange={(u) => setAt(i, u)}
            onRemove={() => removeAt(i)}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={addSlot}
          disabled={images.length >= max}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:border-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add image
        </button>
        <span className="text-xs text-slate-400">
          {images.filter((u) => u.trim()).length}/{max} · first = main, second = hover
        </span>
      </div>
    </div>
  );
}

function ImageRow({
  index,
  label,
  url,
  configured,
  cloud,
  preset,
  folder,
  onChange,
  onRemove,
}: {
  index: number;
  label: string;
  url: string;
  configured: boolean;
  cloud?: string;
  preset?: string;
  folder: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

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
      onChange(data.secure_url as string);
      setStatus("idle");
    } catch {
      setStatus("error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
          {index === 0 && <span className="ml-1 text-slate-400">*</span>}
        </span>
        <button
          type="button"
          aria-label="Remove image"
          onClick={onRemove}
          className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-400 hover:border-red-300 hover:text-red-600"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => onChange(e.target.value)}
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
          Upload failed — check the preset is unsigned, or paste a URL.
        </p>
      )}
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-2 h-24 rounded object-cover" />
      )}
    </div>
  );
}
