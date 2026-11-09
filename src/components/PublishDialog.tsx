"use client";

import { useEffect, useMemo, useState } from "react";
import { slugify } from "@/lib/slug";
import { shrinkImage } from "@/lib/image";
import { customRowError, type Biodata } from "@/data/biodata";

type Status = "idle" | "publishing" | "done" | "error";

export default function PublishDialog({
  data,
  templateId,
  onClose,
}: {
  data: Biodata;
  templateId: string;
  onClose: () => void;
}) {
  const [slug, setSlug] = useState(() => slugify(data.values.fullName || "") || "my-biodata");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [finalSlug, setFinalSlug] = useState("");
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const cleanSlug = useMemo(() => slugify(slug), [slug]);
  const fullUrl = `${origin}/${finalSlug || cleanSlug}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const publish = async () => {
    const rowError = customRowError(data);
    if (rowError) {
      setError(rowError);
      setStatus("error");
      return;
    }
    setStatus("publishing");
    setError("");
    try {
      const photo = data.photo ? await shrinkImage(data.photo) : undefined;
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: cleanSlug, templateId, data: { ...data, photo } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setFinalSlug(json.slug);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {status !== "done" ? (
          <>
            <h2 className="text-lg font-bold text-ink">Publish &amp; get your link</h2>
            <p className="mt-1 text-sm text-muted">
              Choose your link. Anyone with it can view and download this biodata.
            </p>

            <label className="mt-5 block text-sm font-medium text-ink">Your link</label>
            <div className="mt-1.5 flex items-center overflow-hidden rounded-lg border border-line focus-within:border-maroon">
              <span className="whitespace-nowrap bg-canvas px-3 py-2 text-sm text-muted">
                {origin.replace(/^https?:\/\//, "")}/
              </span>
              <input
                autoFocus
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="rohit-biodata"
                className="flex-1 px-2 py-2 text-sm text-ink focus:outline-none"
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              Preview: <span className="font-medium text-ink">{fullUrl}</span>
            </p>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={publish}
                disabled={status === "publishing" || !cleanSlug}
                className="inline-flex items-center gap-2 rounded-lg bg-maroon px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-maroon-dark disabled:opacity-60"
              >
                {status === "publishing" ? "Publishing…" : "Publish"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-green-100 text-green-700">✓</span>
              <h2 className="text-lg font-bold text-ink">Your biodata is live!</h2>
            </div>
            <p className="mt-1 text-sm text-muted">Share this link on WhatsApp or anywhere.</p>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-canvas p-2">
              <input
                readOnly
                value={fullUrl}
                className="flex-1 bg-transparent px-2 text-sm text-ink focus:outline-none"
              />
              <button
                onClick={copy}
                className="rounded-md bg-maroon px-3 py-1.5 text-xs font-semibold text-white hover:bg-maroon-dark"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="mt-5 flex justify-between gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent("My marriage biodata: " + fullUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:border-maroon hover:text-maroon"
              >
                Share on WhatsApp
              </a>
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-maroon px-5 py-2 text-sm font-semibold text-white hover:bg-maroon-dark"
              >
                Open link
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
