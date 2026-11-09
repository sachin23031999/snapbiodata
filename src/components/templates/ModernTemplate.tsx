import { renderedSections, displayName, type TemplateProps } from "./shared";

/**
 * Modern template — two columns: a maroon sidebar (photo + contact) and a
 * white main column (name + personal/family details).
 */
export default function ModernTemplate({ data }: TemplateProps) {
  const sections = renderedSections(data);
  const sidebar = sections.filter((s) => s.id === "contact");
  const main = sections.filter((s) => s.id !== "contact");

  return (
    <div className="a4 doc text-ink">
      <div className="flex min-h-[297mm]">
        {/* Sidebar */}
        <aside className="w-[68mm] shrink-0 bg-maroon px-[10mm] py-[14mm] text-white">
          {data.photo && (
            <div className="mx-auto mb-7 h-[140px] w-[140px] overflow-hidden rounded-full border-[3px] border-gold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.photo} alt={displayName(data)} className="h-full w-full object-cover" />
            </div>
          )}

          {sidebar.map((section) => (
            <section key={section.id} className="mb-8">
              <h2 className="doc-display mb-3 border-b border-white/25 pb-1 text-[13px] font-semibold uppercase tracking-wider text-gold">
                {section.title}
              </h2>
              <dl className="space-y-2.5">
                {section.rows.map((row) => (
                  <div key={row.id} className="text-[12.5px] leading-snug">
                    <dt className="text-white/60">{row.label}</dt>
                    <dd className="font-medium text-white">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </aside>

        {/* Main */}
        <div className="flex-1 px-[12mm] py-[14mm]">
          {data.header && (
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold">{data.header}</p>
          )}
          <h1 className="doc-display mt-2 text-[34px] font-bold leading-tight text-maroon">
            {displayName(data)}
          </h1>
          <div className="mt-2 h-[3px] w-20 bg-gold" />

          <div className="mt-8 space-y-7">
            {main.map((section) => (
              <section key={section.id}>
                <h2 className="doc-display mb-3 text-[15px] font-semibold uppercase tracking-wide text-maroon">
                  {section.title}
                </h2>
                <dl className="space-y-1.5">
                  {section.rows.map((row) => (
                    <div key={row.id} className="flex gap-3 text-[13px] leading-relaxed">
                      <dt className="w-[40%] shrink-0 font-semibold text-ink/75">{row.label}</dt>
                      <dd className="flex-1 text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
