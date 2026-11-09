"use client";

import { useId, useState, type ChangeEvent, type ReactNode } from "react";
import {
  biodataSections,
  filledCount,
  headerPresets,
  emptyBiodata,
  sampleBiodata,
  getBiodataSections,
  moveBiodataRow,
  normalizeBiodataRowOrder,
  removeBiodataRow,
  restoreBiodataRow,
  type Biodata,
  type FieldDef,
  type SectionDef,
  type RowMoveDirection,
} from "@/data/biodata";
import { ChevronDownIcon } from "@/components/ui/icons";
import Button from "@/components/ui/Button";

const fieldClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-maroon/10";

/** Copy a Biodata so component state never aliases the shared module singletons. */
const clone = (b: Biodata): Biodata => ({
  ...b,
  values: { ...b.values },
  hiddenFields: b.hiddenFields?.slice(),
  customRows: b.customRows?.map((row) => ({ ...row })),
  rowOrder: normalizeBiodataRowOrder(b),
});

interface Props {
  data: Biodata;
  onChange: (next: Biodata) => void;
}

export default function BiodataForm({ data, onChange }: Props) {
  const [photoError, setPhotoError] = useState("");
  const [rowStatus, setRowStatus] = useState("");
  const [resetVersion, setResetVersion] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({
    photo: true,
    personal: true,
    family: false,
    contact: false,
  });
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const setValue = (key: string, value: string) =>
    onChange({ ...data, values: { ...data.values, [key]: value } });
  const setHeader = (header: string) => onChange({ ...data, header });
  const reset = (next: Biodata) => {
    setPhotoError("");
    setRowStatus("");
    setResetVersion((version) => version + 1);
    onChange(clone(next));
  };

  const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file (JPG, PNG, etc.).");
      e.target.value = "";
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setPhotoError("That image is too large — please use one under 12 MB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setPhotoError("Sorry, that image couldn't be loaded. Please try another.");
    reader.onload = () => onChange({ ...data, photo: String(reader.result) });
    reader.readAsDataURL(file);
    // Reset the input so re-selecting the same file (e.g. after Remove) still fires.
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted">Live preview updates as you type.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => reset(sampleBiodata)}
            className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-ink hover:border-maroon hover:text-maroon"
          >
            Load sample
          </button>
          <button
            type="button"
            onClick={() => reset(emptyBiodata)}
            className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-ink hover:border-maroon hover:text-maroon"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Photo & Heading */}
      <Accordion
        id="photo"
        title="Photo & Heading"
        badge={`${(data.photo ? 1 : 0) + (data.header.trim() ? 1 : 0)}/2`}
        open={!!open.photo}
        onToggle={toggle}
      >
        <div className="flex items-center gap-4">
          <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md border border-line bg-canvas">
            {data.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.photo} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">No photo</div>
            )}
          </div>
          <div className="space-y-2">
            <label className="inline-block cursor-pointer rounded-lg bg-maroon px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-maroon-dark">
              {data.photo ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            </label>
            {data.photo && (
              <button
                type="button"
                onClick={() => onChange({ ...data, photo: undefined })}
                className="ml-2 text-sm text-muted hover:text-maroon"
              >
                Remove
              </button>
            )}
            <p className="text-xs text-muted">Kept on your device — only uploaded if you publish a link.</p>
            {photoError && <p className="text-xs font-medium text-red-600">{photoError}</p>}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-ink">Heading</label>
          <select
            value={headerPresets.includes(data.header) ? data.header : "__custom"}
            onChange={(e) => setHeader(e.target.value === "__custom" ? data.header : e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-maroon focus:outline-none"
          >
            {headerPresets.map((h) => (
              <option key={h || "none"} value={h}>
                {h || "— None —"}
              </option>
            ))}
            <option value="__custom">Custom…</option>
          </select>
          <input
            type="text"
            value={data.header}
            onChange={(e) => setHeader(e.target.value)}
            placeholder="Type a custom heading"
            className="mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-maroon focus:outline-none"
          />
        </div>
      </Accordion>

      <p role="status" className="text-xs text-muted">{rowStatus}</p>
      {getBiodataSections(data).map((section) => (
        <Accordion
          key={section.id}
          id={section.id}
          title={section.title}
          badge={`${filledCount(section, data.values)}/${section.fields.length}`}
          open={!!open[section.id]}
          onToggle={toggle}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {section.fields.map((field, index) => (
              <Field
                key={field.key}
                field={field}
                value={data.values[field.key] ?? ""}
                onChange={(v) => setValue(field.key, v)}
                custom={data.customRows?.some((row) => row.id === field.key)}
                canMoveUp={index > 0}
                canMoveDown={index < section.fields.length - 1}
                onMove={(direction) => {
                  onChange(moveBiodataRow(data, section.id, field.key, direction));
                  const position = index + (direction === "up" ? -1 : 1) + 1;
                  setRowStatus(`${field.label || "Custom"} row moved ${direction}. Position ${position} of ${section.fields.length} in ${section.title}.`);
                }}
                onLabelChange={(label) => onChange({
                  ...data,
                  customRows: data.customRows?.map((row) => row.id === field.key ? { ...row, label } : row),
                })}
                onRemove={() => {
                  onChange(removeBiodataRow(data, field.key));
                  setRowStatus(`${field.label || "Custom"} row removed. Its value has been deleted.`);
                  document.getElementById(`accordion-${section.id}`)?.focus();
                }}
              />
            ))}
          </div>
          {section.fields.length === 0 && <p className="text-sm text-muted">No rows in this section. Add a row below.</p>}
          <RowControls
            key={resetVersion}
            section={section}
            data={data}
            onChange={onChange}
            onStatus={setRowStatus}
          />
        </Accordion>
      ))}
    </div>
  );
}

function Accordion({
  id,
  title,
  badge,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  badge: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <button
        type="button"
        id={`accordion-${id}`}
        onClick={() => onToggle(id)}
        aria-expanded={open}
        aria-controls={`section-${id}`}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-wider text-maroon">{title}</span>
        <span className="flex items-center gap-2.5">
          <span className="rounded-full bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted">{badge}</span>
          <ChevronDownIcon className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && <div id={`section-${id}`} className="border-t border-line p-4">{children}</div>}
    </section>
  );
}

function Field({
  field,
  value,
  onChange,
  custom,
  onLabelChange,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
  custom?: boolean;
  onLabelChange: (label: string) => void;
  onRemove: () => void;
  onMove: (direction: RowMoveDirection) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const wide = field.type === "textarea";
  const inputId = `field-${field.key}`;
  const invalidLabel = custom && !field.label.trim();

  return (
    <div
      className={wide ? "min-w-0 sm:col-span-2" : "min-w-0"}
      role={custom ? "group" : undefined}
      aria-label={custom ? `${field.label || "Untitled"} custom row` : undefined}
      data-row-id={field.key}
    >
      {custom && (
        <div className="mb-2">
          <label htmlFor={`${inputId}-label`} className="mb-1.5 block text-sm font-medium text-ink">Row label</label>
          <input
            id={`${inputId}-label`}
            value={field.label}
            onChange={(e) => onLabelChange(e.target.value)}
            className={fieldClass}
            required
            aria-invalid={invalidLabel || undefined}
            aria-describedby={invalidLabel ? `${inputId}-error` : undefined}
          />
          {invalidLabel && <p id={`${inputId}-error`} role="alert" className="mt-1 text-xs text-red-600">Enter a row label, or remove this row.</p>}
        </div>
      )}
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-ink">{custom ? "Row value" : field.label}</label>
        <Button
          type="button"
          variant="ghost"
          className="!px-1 !py-1 !text-xs"
          aria-label={`Remove ${field.label || "custom"} row`}
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>
      {field.type === "select" ? (
        <select id={inputId} value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
          <option value="">— Select —</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={2}
          className={fieldClass}
        />
      ) : field.type === "combo" ? (
        <>
          {/* Type-or-select: free text with suggestions from a datalist. */}
          <input
            id={inputId}
            type="text"
            list={`${field.key}-options`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={fieldClass}
            autoComplete="off"
          />
          <datalist id={`${field.key}-options`}>
            {field.options?.map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </>
      ) : (
        <input
          id={inputId}
          type={field.type ?? "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={fieldClass}
        />
      )}
      {custom && (
        <div className="mt-2 flex gap-2">
          {(["up", "down"] as const).map((direction) => (
            <Button
              key={direction}
              id={`${inputId}-${direction}`}
              type="button"
              variant="secondary"
              className="min-h-11 flex-1 !px-2 !text-xs"
              aria-label={`Move ${field.label || "custom"} row ${direction}`}
              disabled={direction === "up" ? !canMoveUp : !canMoveDown}
              onClick={() => {
                onMove(direction);
                requestAnimationFrame(() => {
                  const preferred = document.getElementById(`${inputId}-${direction}`);
                  const fallback = document.getElementById(`${inputId}-${direction === "up" ? "down" : "up"}`);
                  if (preferred instanceof HTMLButtonElement && !preferred.disabled) preferred.focus();
                  else fallback?.focus();
                });
              }}
            >
              Move {direction}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function RowControls({
  section,
  data,
  onChange,
  onStatus,
}: {
  section: SectionDef;
  data: Biodata;
  onChange: (data: Biodata) => void;
  onStatus: (message: string) => void;
}) {
  const id = useId();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const removed = biodataSections.find((s) => s.id === section.id)!.fields
    .filter((field) => data.hiddenFields?.includes(field.key));

  const close = () => {
    setAdding(false);
    setLabel("");
    setValue("");
    setError("");
    document.getElementById(`${id}-button`)?.focus();
  };

  return (
    <div className="mt-4 space-y-3 border-t border-line pt-4">
      {removed.length > 0 && (
        <div>
          <label htmlFor={`${id}-restore`} className="mb-1.5 block text-sm font-medium text-ink">Re-add predefined row</label>
          <select
            id={`${id}-restore`}
            className={fieldClass}
            value=""
            onChange={(e) => {
              if (!e.target.value) return;
              onChange(restoreBiodataRow(data, e.target.value));
              onStatus("Row re-added with an empty value.");
              document.getElementById(`accordion-${section.id}`)?.focus();
            }}
          >
            <option value="">Choose a removed row</option>
            {removed.map((field) => <option key={field.key} value={field.key}>{field.label}</option>)}
          </select>
        </div>
      )}
      <Button
        id={`${id}-button`}
        type="button"
        variant="secondary"
        className="!text-xs"
        aria-expanded={adding}
        aria-controls={`${id}-add`}
        onClick={() => setAdding((current) => !current)}
      >
        Add custom row
      </Button>
      {adding && (
        <form
          id={`${id}-add`}
          noValidate
          className="space-y-3 rounded-lg border border-line bg-canvas p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!label.trim()) {
              setError("Enter a label for your custom row.");
              document.getElementById(`${id}-label`)?.focus();
              return;
            }
            const rowId = `custom-${crypto.randomUUID()}`;
            onChange({
              ...data,
              values: { ...data.values, [rowId]: value },
              customRows: [...(data.customRows ?? []), { id: rowId, sectionId: section.id, label: label.trim() }],
            });
            onStatus(`${label.trim()} row added to ${section.title}.`);
            close();
          }}
        >
          <div>
            <label htmlFor={`${id}-label`} className="mb-1.5 block text-sm font-medium text-ink">New row label</label>
            <input
              id={`${id}-label`}
              autoFocus
              required
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setError("");
              }}
              placeholder="e.g. Languages spoken"
              className={fieldClass}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
            />
          </div>
          <div>
            <label htmlFor={`${id}-value`} className="mb-1.5 block text-sm font-medium text-ink">New row value</label>
            <textarea id={`${id}-value`} value={value} onChange={(e) => setValue(e.target.value)} rows={2} className={fieldClass} />
          </div>
          {error && <p id={`${id}-error`} role="alert" className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" className="!text-xs">Add row</Button>
            <Button type="button" variant="ghost" className="!text-xs" onClick={close}>Cancel</Button>
          </div>
        </form>
      )}
      <p className="text-xs text-muted">Move custom rows up or down within this section. Removing a row deletes its value. Predefined rows can be re-added above.</p>
    </div>
  );
}
