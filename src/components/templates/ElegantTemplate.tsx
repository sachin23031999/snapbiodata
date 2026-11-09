import { renderedSections, displayName, type TemplateProps } from "./shared";

/**
 * Elegant template — airy, centered, lots of whitespace with thin gold rules.
 */
export default function ElegantTemplate({ data }: TemplateProps) {
  const sections = renderedSections(data);

  return (
    <div className="a4 doc text-ink">
      <div className="min-h-[297mm] px-[20mm] py-[18mm]">
        {/* Header */}
        <div className="text-center">
          {data.header && (
            <p className="text-[12px] uppercase tracking-[0.35em] text-gold">{data.header}</p>
          )}
          {data.photo && (
            <div className="mx-auto mt-6 h-[130px] w-[130px] overflow-hidden rounded-full border-[3px] border-gold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.photo} alt={displayName(data)} className="h-full w-full object-cover" />
            </div>
          )}
          <h1 className="doc-display mt-6 text-[36px] font-semibold tracking-wide text-ink">
            {displayName(data)}
          </h1>
          <div className="mx-auto mt-4 flex items-center justify-center gap-3 text-gold">
            <span className="h-px w-16 bg-gold/50" />
            <span>❖</span>
            <span className="h-px w-16 bg-gold/50" />
          </div>
        </div>

        {/* Sections */}
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.id}>
              <h2 className="doc-display mb-4 text-center text-[13px] font-semibold uppercase tracking-[0.3em] text-maroon">
                {section.title}
              </h2>
              <dl className="mx-auto max-w-[150mm] space-y-2">
                {section.rows.map((row) => (
                  <div key={row.id} data-biodata-row={row.id} className="flex justify-between gap-6 border-b border-line pb-1.5 text-[13.5px]">
                    <dt className="text-muted">{row.label}</dt>
                    <dd className="text-right font-medium text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
