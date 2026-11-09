import FramedDoc from "./FramedDoc";
import { displayName, type RenderedRow, type TemplateProps } from "./shared";
import { CornerFloral, OmMark, Sprig } from "./ornaments";

/**
 * Floral template — cream page with gold filigree corners and an Om motif.
 * Multi-page safe via FramedDoc.
 */
export default function FloralTemplate({ data }: TemplateProps) {
  const frame = () => (
    <div className="bio-frame text-[#c79a3a]" style={{ background: "#fffdf6" }}>
      <div className="absolute inset-[8mm] border border-[#caa64a]/60" />
      <CornerFloral className="absolute left-[7mm] top-[7mm] h-16 w-16" />
      <CornerFloral className="absolute right-[7mm] top-[7mm] h-16 w-16 -scale-x-100" />
      <CornerFloral className="absolute bottom-[7mm] left-[7mm] h-16 w-16 -scale-y-100" />
      <CornerFloral className="absolute bottom-[7mm] right-[7mm] h-16 w-16 -scale-100" />
    </div>
  );

  const header = (
    <div>
      <div className="text-center">
        <OmMark className="text-[28px] text-[#b8893a]" />
        {data.header && (
          <p className="mt-1 flex items-center justify-center gap-2 text-[12px] uppercase tracking-[0.25em] text-[#b8893a]">
            <Sprig className="h-3 w-10" />
            {data.header}
            <Sprig className="h-3 w-10" flip />
          </p>
        )}
      </div>
      <div className="mt-6 flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="doc-display text-[30px] font-bold leading-tight text-[#8a2b2b]">{displayName(data)}</h1>
          <div className="mt-2 h-[2px] w-24 bg-[#c79a3a]" />
        </div>
        {data.photo && (
          <div className="shrink-0 border-2 border-[#c79a3a] p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.photo} alt={displayName(data)} className="h-[150px] w-[120px] object-cover" />
          </div>
        )}
      </div>
    </div>
  );

  const renderHeading = (title: string) => (
    <h2 className="doc-display flex items-center gap-3 text-[15px] font-semibold uppercase tracking-wide text-[#8a2b2b]">
      <span>{title}</span>
      <span className="h-px flex-1 bg-[#c79a3a]/50" />
    </h2>
  );

  const renderRow = (row: RenderedRow) => (
    <div data-biodata-row={row.id} className="flex gap-3 text-[13px] leading-relaxed text-[#4a3b22]">
      <div className="w-[38%] shrink-0 font-semibold text-[#6b5836]">{row.label}</div>
      <div className="flex-1">
        <span className="mr-2 text-[#b8893a]">:</span>
        {row.value}
      </div>
    </div>
  );

  return (
    <FramedDoc
      data={data}
      bg="#fffdf6"
      padX={20}
      padTop={22}
      padBottom={20}
      frame={frame}
      header={header}
      renderHeading={renderHeading}
      renderRow={renderRow}
    />
  );
}
