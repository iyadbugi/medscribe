import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, Bricolage_Grotesque } from "next/font/google";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import GlassSurface from "@/components/GlassSurface";
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
        <SmoothScroll>

        <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4 sm:top-4">
          <GlassSurface
            width={"min(94vw, 760px)" as unknown as number}
            height={56}
            borderRadius={46}
            borderWidth={0.18}
            brightness={50}
            opacity={0.93}
            blur={11}
            displace={0.5}
            backgroundOpacity={0.32}
            saturation={1}
            distortionScale={-180}
            redOffset={0}
            greenOffset={6}
            blueOffset={20}
            className="pointer-events-auto"
          >
            <nav className="flex h-full w-full items-center justify-between gap-2 pl-4 pr-2 sm:pl-5 sm:pr-2">
              <a href="/" className="group flex items-baseline gap-1">
                <span className="font-display text-xl leading-none tracking-tight text-[color:var(--sage-deep)] drop-shadow-[0_1px_0_rgba(255,255,255,0.4)] sm:text-2xl">
                  med
                </span>
                <span className="font-display-italic text-xl leading-none tracking-tight text-foreground drop-shadow-[0_1px_0_rgba(255,255,255,0.4)] sm:text-2xl">
                  scribe
                </span>
                <span className="ml-0.5 size-1.5 translate-y-[-2px] rounded-full bg-[color:var(--clay)]" />
              </a>
              <div className="flex items-center gap-0.5 text-sm">
                <a
                  href="#how"
                  className="hidden sm:inline-flex h-9 items-center rounded-full px-3.5 text-foreground/85 drop-shadow-[0_1px_0_rgba(255,255,255,0.4)] hover:text-foreground transition-colors"
                >
                  How it works
                </a>
                <a
                  href="#privacy"
                  className="hidden sm:inline-flex h-9 items-center rounded-full px-3.5 text-foreground/85 drop-shadow-[0_1px_0_rgba(255,255,255,0.4)] hover:text-foreground transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="#start"
                  className="ml-1 inline-flex h-10 items-center gap-2 rounded-full bg-[color:var(--sage-deep)] px-4 text-sm text-[color:var(--primary-foreground)] shadow-[0_4px_14px_-4px_color-mix(in_oklch,var(--sage-deep)_55%,transparent)] hover:opacity-90 transition-opacity"
                >
                  <span className="size-1.5 rounded-full bg-[color:var(--clay)]" />
                  Try the demo
                </a>
              </div>
            </nav>
          </GlassSurface>
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
                <span className="ml-0.5 size-1.5 translate-y-[-2px] rounded-full bg-[color:var(--clay)]" />
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
        </SmoothScroll>
      </body>
    </html>
  );
}
