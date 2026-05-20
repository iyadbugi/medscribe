"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { Server, Cpu, MicOff, FolderLock } from "lucide-react";
import { BlurText } from "@/components/motion/blur-text";
import { Section, Container } from "@/components/section";

function SpotlightPillar({
  className,
  delay,
  children,
}: {
  className: string;
  delay: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ margin: "-10% 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={`group ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block"
        style={{
          background:
            "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklch, #3b82f6 40%, transparent), transparent 55%)",
        }}
      />
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: Server,
    title: "Patient data stays in the UAE.",
    description:
      "Federal Law No. 2 of 2019 keeps UAE health data inside the country. Our backend runs only on UAE-hosted infrastructure — no cross-border transfer.",
  },
  {
    icon: Cpu,
    title: "The model runs on your device.",
    description:
      "SOAP notes are drafted on the clinician’s own machine. No PHI ever reaches OpenAI, Anthropic, or any third-party LLM. Your patients train no one.",
  },
  {
    icon: MicOff,
    title: "Audio is discarded after the summary.",
    description:
      "Recordings live only in the browser, used once to produce the transcript, then discarded. Nothing hits disk. There is no archive to breach.",
  },
  {
    icon: FolderLock,
    title: "Your EMR is still the record.",
    description:
      "We don’t create a parallel patient database. The final note lives only in the clinic’s EMR — already on the hook for the federal 25-year retention rule.",
  },
];

export function PrivacyFeatures() {
  return (
    <Section id="privacy" className="relative bg-card">
      {/* Dashed grid wash, fading in from top-right */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, color-mix(in oklch, var(--sage-deep) 14%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in oklch, var(--sage-deep) 14%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "22px 22px",
          maskImage: `
            repeating-linear-gradient(to right, black 0 3px, transparent 3px 8px),
            repeating-linear-gradient(to bottom, black 0 3px, transparent 3px 8px),
            radial-gradient(ellipse 140% 120% at 100% 100%, #000 35%, transparent 100%)
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(to right, black 0 3px, transparent 3px 8px),
            repeating-linear-gradient(to bottom, black 0 3px, transparent 3px 8px),
            radial-gradient(ellipse 140% 120% at 100% 100%, #000 35%, transparent 100%)
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />

      <Container className="relative z-10">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <BlurText
            as="span"
            className="block text-[11px] uppercase tracking-[0.2em] text-[color:var(--sage-deep)]/80"
          >
            Privacy
          </BlurText>

          <BlurText
            as="h2"
            delay={0.08}
            className="mt-2 max-w-3xl font-display text-3xl leading-[1.02] tracking-[-0.03em] text-foreground sm:text-4xl md:text-5xl"
          >
            Built around UAE health data law.
          </BlurText>

          <BlurText
            as="p"
            delay={0.16}
            className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            Federal Law No. 2 of 2019, the PDPL, and DHA&rsquo;s AI Policy
            don&rsquo;t ask for marketing — they ask for architecture. Here is
            ours.
          </BlurText>
        </div>

        {/* Pillars grid — 4 cols on lg, 2 on md, 1 on sm; bordered, no gap */}
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-border md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLast = index === features.length - 1;
            const isLastRowOnMd = index >= features.length - 2;
            const isRightColOnMd = index % 2 === 1;
            const isLastColOnLg = index === features.length - 1;
            return (
              <SpotlightPillar
                key={feature.title}
                delay={index * 0.09}
                className={`relative overflow-hidden bg-card p-5 md:p-6 ${
                  isLast ? "" : "border-b border-border"
                } ${isLastRowOnMd ? "md:border-b-0" : ""} ${
                  isRightColOnMd ? "" : "md:border-r md:border-border"
                } lg:border-b-0 ${
                  isLastColOnLg ? "lg:border-r-0" : "lg:border-r lg:border-border"
                }`}
              >
                {/* Soft gold halo behind the icon */}
                <div className="mb-4 flex justify-center">
                  <div className="relative grid size-14 place-items-center sm:size-16">
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 50%, color-mix(in oklch, #3b82f6 55%, transparent) 0%, transparent 70%)",
                      }}
                    />
                    <Icon
                      className="relative size-8 text-[#1e40af] sm:size-9"
                      strokeWidth={0.8}
                    />
                  </div>
                </div>

                <h3 className="mb-2 font-display text-base leading-tight tracking-[-0.02em] text-foreground sm:text-lg">
                  {feature.title}
                </h3>

                <p className="text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                  {feature.description}
                </p>
              </SpotlightPillar>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
