"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import BiodataForm from "@/components/BiodataForm";
import BiodataPreview from "@/components/BiodataPreview";
import TemplatePicker from "@/components/TemplatePicker";
import SupportDialog from "@/components/SupportDialog";
import Button from "@/components/ui/Button";
import { ArrowRightIcon, DownloadIcon, HeartIcon } from "@/components/ui/icons";
import { defaultTemplateId, getTemplate } from "@/components/templates";
import { customRowError, sampleBiodata, type Biodata } from "@/data/biodata";
import { slugify } from "@/lib/slug";

export default function CreatePage() {
  const [data, setData] = useState<Biodata>(sampleBiodata);
  const [templateId, setTemplateId] = useState<string>(defaultTemplateId);
  const [showPublish, setShowPublish] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t");
    if (t && getTemplate(t).id === t) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTemplateId(t);
    }
  }, []);

  // We render the PDF ourselves (see lib/pdf) instead of window.print(), so the
  // output is identical on every device. Ensure the preview is visible first
  // (on mobile it may be on the hidden tab) and let it lay out before capturing.
  const handleDownload = useCallback(async () => {
    const error = customRowError(data);
    if (error) {
      window.alert(error);
      setMobileTab("edit");
      return;
    }
    setMobileTab("preview");
    setDownloading(true);
    try {
      await new Promise((r) => window.setTimeout(r, 300));
      const area = document.getElementById("print-area");
      if (!area) throw new Error("preview not ready");
      // Name-based filename; non-Latin names (e.g. Hindi) slugify to empty, so
      // fall back to a plain "biodata.pdf" rather than "biodata-biodata.pdf".
      const slug = slugify(data.values.fullName || "");
      const filename = slug ? `${slug}-biodata.pdf` : "biodata.pdf";
      const { downloadBiodataPdf } = await import("@/lib/pdf");
      await downloadBiodataPdf(area, filename);
    } catch (err) {
      console.error(err);
      window.alert("Sorry, the PDF couldn't be generated. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [data]);

  const downloadBtn = (cls = "") => (
    <Button variant="secondary" className={cls} onClick={handleDownload} disabled={downloading}>
      <DownloadIcon />
      {downloading ? "Preparing…" : "Download PDF"}
    </Button>
  );

  const publishBtn = (cls = "") => (
    <Button variant="primary" className={cls} onClick={() => {
      const error = customRowError(data);
      if (error) {
        window.alert(error);
        setMobileTab("edit");
        return;
      }
      setShowPublish(true);
    }}>
      <ArrowRightIcon />
      Share
    </Button>
  );

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-canvas lg:h-screen lg:overflow-hidden">
      {/* Header */}
      <header className="no-print sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6 sm:py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl maroon-gradient text-white ring-1 ring-gold/40 shadow-sm sm:h-9 sm:w-9">
              <HeartIcon className="h-4 w-4" />
            </span>
            <span className="leading-tight">
              <span className="font-display block text-sm font-bold text-ink sm:text-base">SnapBiodata</span>
              <span className="hidden text-xs text-muted sm:block">Free · private · no sign-up</span>
            </span>
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            {downloadBtn()}
            {publishBtn()}
          </div>
        </div>
        {/* Mobile Edit / Preview tabs */}
        <div className="flex border-t border-line sm:hidden">
          {(["edit", "preview"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${
                mobileTab === tab ? "border-b-2 border-maroon text-maroon" : "text-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {showPublish && <SupportDialog onClose={() => setShowPublish(false)} />}

      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 px-3 pb-24 pt-4 sm:px-6 sm:pb-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:min-h-0 lg:overflow-hidden print:!block print:!p-0">
        {/* Controls */}
        <div
          className={`no-print space-y-5 ${mobileTab === "edit" ? "block" : "hidden"} lg:block lg:min-h-0 lg:overflow-y-auto lg:pb-6 lg:pr-2 scroll-slim`}
        >
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-maroon">Choose a template</h2>
            <TemplatePicker templateId={templateId} onSelect={setTemplateId} />
          </div>
          <BiodataForm data={data} onChange={setData} />
        </div>

        {/* Preview (always printable; visible per tab on mobile) */}
        <div
          className={`${mobileTab === "preview" ? "block" : "hidden"} lg:block lg:min-h-0 lg:overflow-y-auto print:!block scroll-slim`}
        >
          <div className="rounded-xl bg-canvas p-1 sm:p-3 print:!p-0">
            <BiodataPreview data={data} templateId={templateId} />
          </div>
        </div>
      </main>

      {/* Mobile sticky action bar */}
      <div className="no-print fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-surface/95 p-3 backdrop-blur sm:hidden">
        {downloadBtn("flex-1")}
        {publishBtn("flex-1")}
      </div>
    </div>
  );
}
