import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config";
import { HeartIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} handles your information. Your biodata stays on your device — we don't collect or upload it.`,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: "/privacy",
    title: `Privacy Policy — ${SITE.name}`,
    description: `How ${SITE.name} handles your information. Your biodata stays on your device.`,
  },
};

const LAST_UPDATED = "16 July 2026";

export default function PrivacyPage() {
  return (
    <div className="paper-bg min-h-screen overflow-x-clip text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl maroon-gradient text-white ring-1 ring-gold/40 shadow-sm">
              <HeartIcon className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              {SITE.name}
            </span>
          </Link>
          <Link
            href="/create"
            className="rounded-lg maroon-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-maroon/25 ring-1 ring-inset ring-white/15 transition-transform hover:-translate-y-0.5"
          >
            Create free
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 space-y-8 leading-relaxed text-ink/90">
          <p>
            {SITE.name} helps you create print-ready marriage biodata PDFs from
            customizable templates. We respect your privacy and have designed the
            app so that your information stays on your own device. This policy
            explains what information is handled, how, and your choices. It applies
            to both our website ({SITE.url}) and the {SITE.name} mobile app.
          </p>

          <Section title="1. Information you provide (stays on your device)">
            To create a biodata, you may enter personal details such as your name,
            date of birth, education, occupation, family information, contact
            details, and an optional photo.{" "}
            <strong>
              This content is processed and stored only on your device
            </strong>{" "}
            and is used solely to generate your biodata document. The PDF is
            created on your device — we do <strong>not</strong> transmit your
            details to our servers, we do not have access to them, and we do not
            sell or share them with third parties.
          </Section>

          <Section title="2. Information we do NOT collect">
            We do not require you to create an account. We do not collect your
            name, email, phone number, contacts, precise location, or advertising
            identifiers on our servers, and we do not use your data for
            advertising or cross-app/website tracking.
          </Section>

          <Section title="3. Information handled automatically">
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong>App updates (mobile app).</strong> The app checks for
                updates to stay current. On iOS it uses Apple&rsquo;s App Store
                lookup and, for over-the-air updates, Expo Application Services;
                on Android it uses Google Play&rsquo;s in-app update service.
                These requests include only technical details (device OS version,
                app version, update runtime identifier) — never your biodata.
              </li>
              <li>
                <strong>Basic analytics &amp; diagnostics.</strong> We may process
                aggregate, non-identifying usage and stability information (such
                as page views, device type, and app/OS version) to keep the
                product working well. This is not linked to your identity and is
                not used to track you.
              </li>
            </ul>
          </Section>

          <Section title="4. Sharing happens only when you choose">
            When you download, publish, or share a biodata, it is handled by the
            option you pick (your device&rsquo;s share sheet, printing, email,
            messaging apps, or a private share link you generate). Any sharing at
            that point is under your control and governed by those services&rsquo;
            own policies.
          </Section>

          <Section title="5. Third-party services">
            <ul className="ml-5 list-disc space-y-1">
              <li>
                Vercel (website hosting &amp; privacy-friendly analytics) —{" "}
                <a className="text-maroon underline" href="https://vercel.com/legal/privacy-policy">
                  vercel.com/legal/privacy-policy
                </a>
              </li>
              <li>
                Expo Application Services (mobile app updates) —{" "}
                <a className="text-maroon underline" href="https://expo.dev/privacy">
                  expo.dev/privacy
                </a>
              </li>
              <li>
                Apple App Store —{" "}
                <a className="text-maroon underline" href="https://www.apple.com/legal/privacy/">
                  apple.com/legal/privacy
                </a>
              </li>
              <li>
                Google Play services —{" "}
                <a className="text-maroon underline" href="https://policies.google.com/privacy">
                  policies.google.com/privacy
                </a>
              </li>
            </ul>
          </Section>

          <Section title="6. Data retention and deletion">
            Because your biodata stays on your device (or in your browser), you
            control it at all times. You can clear or delete any biodata you
            created, and uninstalling the app or clearing your browser data
            removes it. We do not hold copies on our servers. For any question
            about your data, contact us and we will respond promptly.
          </Section>

          <Section title="7. Security">
            Your biodata is kept on your device, and any network requests the app
            or website makes (such as update checks) are sent over encrypted
            connections (HTTPS).
          </Section>

          <Section title="8. Children's privacy">
            {SITE.name} is intended for adults creating marriage biodata and is
            not directed to children under 13. We do not knowingly collect
            personal information from children.
          </Section>

          <Section title="9. Changes to this policy">
            We may update this policy from time to time. Material changes will be
            reflected by updating the &ldquo;Last updated&rdquo; date at the top of
            this page.
          </Section>

          <Section title="10. Contact us">
            {SITE.name}
            <br />
            Email:{" "}
            <a className="text-maroon underline" href={`mailto:${SITE.contactEmail}`}>
              {SITE.contactEmail}
            </a>
            <br />
            Website:{" "}
            <a className="text-maroon underline" href={SITE.url}>
              {SITE.url}
            </a>
          </Section>
        </div>

        <div className="mt-12 border-t border-line pt-6 text-sm text-muted">
          <Link href="/" className="text-maroon underline">
            &larr; Back to {SITE.name}
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="mt-2 text-ink/90">{children}</div>
    </section>
  );
}
