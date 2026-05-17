import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, Bricolage_Grotesque } from "next/font/google";
import { ShieldCheck, MicVocal, FileText, Stethoscope } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

export const metadata: Metadata = {
  title: "MedScribe — Notes that finish themselves.",
  description:
    "Dictate after the visit. Walk out with a clinical SOAP note and a patient-friendly handout, drafted by AI and edited by you.",
};

const marqueeItems = [
  { icon: ShieldCheck, label: "Audio stays in your browser" },
  { icon: MicVocal, label: "One pass dictation" },
  { icon: FileText, label: "SOAP + patient handout in one go" },
  { icon: Stethoscope, label: "Edit before export" },
  { icon: ShieldCheck, label: "No PHI written to disk" },
  { icon: MicVocal, label: "Works after the visit, not during" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground relative overflow-x-clip">
        <div className="grain pointer-events-none fixed inset-0 -z-10" />

        <div className="border-b border-[color-mix(in_oklch,var(--sage-deep)_18%,transparent)] bg-[color-mix(in_oklch,var(--mint)_72%,var(--background))]">
          <div className="overflow-hidden">
            <div className="animate-marquee flex w-max gap-10 py-2.5 text-[11px] uppercase tracking-[0.18em] text-[color:var(--sage-deep)]">
              {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((it, i) => (
                <span key={i} className="flex items-center gap-2 whitespace-nowrap">
                  <it.icon className="size-3.5 opacity-70" strokeWidth={1.6} />
                  <span className="font-medium">{it.label}</span>
                  <span className="opacity-40">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/72 bg-background/85 border-b border-border/60">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8">
            <a href="/" className="group flex items-baseline gap-1">
              <span className="font-display text-2xl leading-none tracking-tight text-[color:var(--sage-deep)]">
                med
              </span>
              <span className="font-display-italic text-2xl leading-none tracking-tight text-foreground">
                scribe
              </span>
              <span className="ml-0.5 size-1.5 translate-y-[-2px] rounded-full bg-[color:var(--clay)]" />
            </a>
            <nav className="flex items-center gap-1 text-sm">
              <a
                href="#how"
                className="hidden sm:inline-flex h-9 items-center rounded-full px-4 text-foreground/70 hover:text-foreground transition-colors"
              >
                How it works
              </a>
              <a
                href="#privacy"
                className="hidden sm:inline-flex h-9 items-center rounded-full px-4 text-foreground/70 hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="/#start"
                className="ml-1 inline-flex h-9 items-center gap-2 rounded-full border border-[color:var(--sage-deep)] bg-[color:var(--sage-deep)] px-4 text-[color:var(--primary-foreground)] hover:opacity-90 transition-opacity"
              >
                <span className="size-1.5 rounded-full bg-[color:var(--clay)]" />
                Try the demo
              </a>
            </nav>
          </div>
        </header>

        {children}

        <footer className="border-t border-border/60 bg-background">
          <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 py-12 sm:grid-cols-3 sm:px-8">
            <div className="sm:col-span-1">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-xl tracking-tight text-[color:var(--sage-deep)]">
                  med
                </span>
                <span className="font-display-italic text-xl tracking-tight text-foreground">
                  scribe
                </span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                A quiet little instrument for clinicians who&rsquo;d rather be
                with patients than with paperwork.
              </p>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                The fine print
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>Prototype. Not for production clinical use.</li>
                <li>Audio is captured locally and discarded after summary.</li>
                <li>Edit every draft before you sign it.</li>
                <li className="text-muted-foreground/80">
                  This hosted preview routes audio through OpenAI Whisper and
                  Claude Sonnet 4.6 via Vercel AI Gateway. Production deploys
                  run a local LLM on-device with UAE-hosted backend.
                </li>
              </ul>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Built with
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>OpenAI Whisper · Structured outputs</li>
                <li>Claude Sonnet 4.6 via Vercel AI Gateway</li>
                <li>Next.js · Tailwind · React PDF</li>
                <li>1st place &middot; Decoding Data Science 2026 Hackathon</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/60">
            <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 py-4 text-xs text-muted-foreground sm:px-8">
              <span>&copy; {new Date().getFullYear()} MedScribe</span>
              <span className="font-display-italic">Notes that finish themselves.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
