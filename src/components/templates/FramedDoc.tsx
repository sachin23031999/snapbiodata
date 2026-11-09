"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { renderedSections, type RenderedRow, type RenderedSection } from "./shared";
import { MM, A4_W, A4_H } from "@/lib/a4";
import { paginate, type Gaps, type Unit } from "@/lib/paginate";
import type { Biodata } from "@/data/biodata";

// Spacing (px) added between units; counted in packing and applied on render.
const GAPS: Gaps = {
  header: 16, // below the page-1 header
  section: 18, // above a section heading (unless it starts a page)
  heading: 10, // below a heading, before its first row
  row: 6, // below each row
};
const BUFFER = 10; // safety so a too-tall page never forces a browser split

export interface FramedDocProps {
  data: Biodata;
  bg?: string;
  padX: number;
  padTop: number;
  padBottom: number;
  frame: (pageIndex: number) => ReactNode;
  header?: ReactNode;
  /** Row-level mode (fills pages, splits long sections, repeats the heading). */
  renderHeading?: (title: string) => ReactNode;
  renderRow?: (row: RenderedRow) => ReactNode;
  /** Atomic mode — keep each whole section together (e.g. 2-column layouts). */
  renderSection?: (section: RenderedSection) => ReactNode;
}

/**
 * Splits a biodata into self-contained, individually-framed A4 pages by
 * measuring each unit. Every printed sheet is one complete framed page, and
 * pages fill tightly (sections continue across a break with the heading
 * repeated). Works the same in every print engine.
 */
export default function FramedDoc(props: FramedDocProps) {
  const { data, bg = "#ffffff", padX, padTop, padBottom, frame, header } = props;
  const sections = renderedSections(data);
  const rowLevel = Boolean(props.renderHeading && props.renderRow);

  // Build the ordered unit list.
  const units: Unit[] = [];
  if (header) units.push({ type: "header" });
  sections.forEach((s, si) => {
    if (rowLevel) {
      units.push({ type: "heading", s: si });
      s.rows.forEach((_, ri) => units.push({ type: "row", s: si, r: ri }));
    } else {
      units.push({ type: "section", s: si });
    }
  });

  // Null-safe: a unit may reference a section/row that no longer exists for a
  // brief render (e.g. cached pages from before the user deleted a field). Guard
  // every lookup and render nothing rather than crash.
  const nodeFor = (u: Unit): ReactNode => {
    if (u.type === "header") return header ?? null;
    const section = sections[u.s];
    if (!section) return null;
    if (u.type === "section") return props.renderSection?.(section) ?? null;
    if (u.type === "heading") return props.renderHeading?.(section.title) ?? null;
    const row = section.rows[u.r];
    if (!row) return null;
    return props.renderRow?.(row) ?? null;
  };

  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const measureRef = useRef<HTMLDivElement>(null);
  // Cache the paginated pages together with the data signature they were built
  // from, so a render never lays out stale pages against freshly-changed data.
  const [paged, setPaged] = useState<{ sig: string; pages: Unit[][] } | null>(null);
  // Bumped whenever the measurer's box changes size (e.g. the preview goes from
  // display:none → visible on mobile), forcing a re-measure + re-paginate.
  const [visibilityTick, setVisibilityTick] = useState(0);

  const sig = JSON.stringify([sections, Boolean(data.photo), data.header, rowLevel]);

  useLayoutEffect(() => {
    const contentPx = A4_H - (padTop + padBottom) * MM - BUFFER;
    const heights = units.map((_, i) => refs.current[i]?.offsetHeight ?? 0);
    // A hidden ancestor measures every unit as 0 — don't paginate from garbage.
    if (heights.every((v) => v === 0) && units.length > 0) return;
    // Derived layout from measured DOM — setting state here is intentional.
    setPaged({ sig, pages: paginate(units, { contentPx, heights, gaps: GAPS }) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, padTop, padBottom, padX, visibilityTick]);

  // Re-paginate when the measurer becomes visible or changes size, and once the
  // web fonts finish loading — on mobile the serif font often loads *after* the
  // first measure, which would otherwise leave the page count measured against
  // the fallback font's metrics.
  useEffect(() => {
    const bump = () => setVisibilityTick((t) => t + 1);
    let ro: ResizeObserver | undefined;
    const el = measureRef.current;
    if (el && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(bump);
      ro.observe(el);
    }
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(bump).catch(() => {});
    return () => ro?.disconnect();
  }, []);

  const contentStyle = {
    paddingLeft: `${padX}mm`,
    paddingRight: `${padX}mm`,
    paddingTop: `${padTop}mm`,
    paddingBottom: `${padBottom}mm`,
  };

  // Only use cached pages when they match the current data; otherwise lay out
  // the current units directly. This prevents rendering pages whose row indices
  // no longer exist after an edit (the cause of the "reading 'label'" crash).
  const laid = paged && paged.sig === sig ? paged.pages : [units];

  return (
    <>
      {/* Hidden measurer — wrapped in a 0×0 clip so it never affects page width. */}
      <div aria-hidden style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <div ref={measureRef} style={{ width: A4_W - 2 * padX * MM }}>
          {units.map((u, i) => (
            <div
              key={unitKey(u)}
              ref={(el) => {
                refs.current[i] = el;
              }}
            >
              {nodeFor(u)}
            </div>
          ))}
        </div>
      </div>

      {laid.map((pageUnits, pi) => (
        <div
          key={pi}
          className="a4 doc relative"
          // break-BEFORE each page after the first. iOS WebKit inserts a blank
          // sheet at `break-after: page`, so we force the next page onto a fresh
          // sheet from its own leading edge instead — no trailing blank page.
          style={{ background: bg, breakBefore: pi > 0 ? "page" : "auto" }}
        >
          {frame(pi)}
          <div className="relative" style={contentStyle}>
            {pageUnits.map((u, j) => (
              <div
                key={unitKey(u)}
                style={{
                  marginTop: u.type === "heading" && j > 0 ? GAPS.section : 0,
                  marginBottom: gapForRender(u),
                }}
              >
                {nodeFor(u)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );

  function unitKey(unit: Unit): string {
    if (unit.type === "header") return "header";
    const section = sections[unit.s];
    if (!section) return `${unit.type}-${unit.s}`;
    return unit.type === "row" ? section.rows[unit.r]?.id ?? `row-${unit.s}-${unit.r}` : `${unit.type}-${section.id}`;
  }
}

function gapForRender(u: Unit): number {
  return u.type === "header"
    ? GAPS.header
    : u.type === "heading"
      ? GAPS.heading
      : u.type === "row"
        ? GAPS.row
        : GAPS.section;
}
