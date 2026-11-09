import FramedDoc from "./FramedDoc";
import { displayName, type RenderedSection, type TemplateProps } from "./shared";
import { Mandala, OmMark } from "./ornaments";

const NAVY = "#1f2a4d";
const GOLD = "#c79a3a";

/**
 * Royal template — deep navy accents, an arch-framed photo, and mandala
 * ornaments. Multi-page safe via FramedDoc.
 */
export default function RoyalTemplate({ data }: TemplateProps) {
  const frame = () => (
    <div className="bio-frame overflow-hidden" style={{ background: "#ffffff" }}>
      <Mandala className="absolute -right-16 -top-16 h-56 w-56 text-[#1f2a4d]/[0.06]" />
      <Mandala className="absolute -bottom-20 -left-16 h-56 w-56 text-[#1f2a4d]/[0.06]" />
    </div>
  );

  const header = (
    <div className="flex flex-col items-center text-center">
      <OmMark className="text-[24px] text-[#c79a3a]" />
      {data.photo && (
        <div
          className="mt-4 overflow-hidden border-[5px]"
          style={{
            borderColor: NAVY,
            borderTopLeftRadius: "999px",
            borderTopRightRadius: "999px",
            width: "150px",
            height: "180px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.photo} alt={displayName(data)} className="h-full w-full object-cover" />
        </div>
      )}
      <h1 className="doc-display mt-5 text-[32px] font-bold uppercase tracking-wide" style={{ color: NAVY }}>
        {displayName(data)}
      </h1>
      <div className="mt-2 flex items-center gap-2" style={{ color: GOLD }}>
        <span className="h-px w-10 bg-current" />
        <span>◆</span>
        <span className="h-px w-10 bg-current" />
      </div>
      {data.header && (
        <p className="mt-2 text-[11px] uppercase tracking-[0.3em]" style={{ color: GOLD }}>
          {data.header}
        </p>
      )}
    </div>
  );

  const renderSection = (section: RenderedSection) => (
    <section className="text-[#26303f]">
      <h2
        className="doc-display mb-3 rounded px-3 py-1.5 text-[14px] font-semibold uppercase tracking-wide text-white"
        style={{ background: NAVY }}
      >
        {section.title}
      </h2>
      {/* Always 2 columns — the document is A4-width regardless of device, so
          it must not use viewport breakpoints (that made mobile paginate to 2). */}
      <dl className="grid grid-cols-2 gap-x-8 gap-y-1.5 px-1">
        {section.rows.map((row) => (
          <div key={row.id} className="flex gap-3 text-[12.5px] leading-relaxed">
            <dt className="w-[42%] shrink-0 font-semibold text-[#55606f]">{row.label}</dt>
            <dd className="flex-1">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );

  return (
    <FramedDoc
      data={data}
      bg="#ffffff"
      padX={16}
      padTop={18}
      padBottom={16}
      frame={frame}
      header={header}
      renderSection={renderSection}
    />
  );
}
