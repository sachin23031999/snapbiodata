import FramedDoc from "./FramedDoc";
import { displayName, type RenderedRow, type TemplateProps } from "./shared";

/**
 * Traditional template — classic maroon & gold framed biodata. Each page is a
 * self-contained framed A4 (via FramedDoc) so multi-page PDFs are framed alike.
 */
export default function TraditionalTemplate({ data }: TemplateProps) {
  const frame = () => (
    <div className="bio-frame" style={{ background: "#ffffff" }}>
      <div className="absolute inset-[10mm] border-2 border-maroon" />
      <div className="absolute inset-[13mm] border border-gold" />
    </div>
  );

  const header = (
    <div>
      {data.header && (
        <p className="doc-display text-center text-[15px] tracking-wide text-gold">
          <Flourish /> <span className="text-maroon">{data.header}</span> <Flourish />
        </p>
      )}
      <div className="mt-5 flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="doc-display text-[34px] font-bold leading-tight text-maroon">{displayName(data)}</h1>
          <div className="mt-2 h-[2px] w-24 bg-gold" />
        </div>
        {data.photo && (
          <div className="shrink-0 rounded-sm border-2 border-gold p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.photo} alt={displayName(data)} className="h-[150px] w-[120px] rounded-sm object-cover" />
          </div>
        )}
      </div>
    </div>
  );

  const renderHeading = (title: string) => (
    <h2 className="doc-display flex items-center gap-3 text-[16px] font-semibold uppercase tracking-wide text-maroon">
      <span>{title}</span>
      <span className="h-px flex-1 bg-gold/60" />
    </h2>
  );

  const renderRow = (row: RenderedRow) => (
    <div data-biodata-row={row.id} className="flex gap-3 text-[13.5px] leading-relaxed">
      <div className="w-[38%] shrink-0 font-semibold text-ink/80">{row.label}</div>
      <div className="flex-1 text-ink">
        <span className="mr-2 text-muted">:</span>
        {row.value}
      </div>
    </div>
  );

  return (
    <FramedDoc
      data={data}
      bg="#ffffff"
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

function Flourish() {
  return <span className="text-gold">❁</span>;
}
