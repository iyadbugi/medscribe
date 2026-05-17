"use client";

import { ArrowRight } from "lucide-react";
import { BlurText } from "@/components/motion/blur-text";

export function ClosingCta() {
  return (
    <section className="w-full bg-[color:var(--sage)] py-24 text-[color:var(--primary-foreground)]">
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <BlurText
          as="span"
          className="block text-[11px] uppercase tracking-[0.22em] opacity-75"
        >
          A quieter way
        </BlurText>
        <BlurText
          as="h2"
          delay={0.08}
          className="mt-5 font-display text-4xl leading-[1.02] tracking-[-0.04em] sm:text-5xl md:text-6xl"
        >
          Notes that{" "}
          <span className="font-display-italic">finish themselves.</span>
        </BlurText>
        <BlurText
          as="p"
          delay={0.18}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed opacity-85 sm:text-lg"
        >
          Memory is sharpest the moment after a visit ends. MedScribe
          turns that minute into a signed note and a plain-English
          handout for the patient who just walked out.
        </BlurText>
        <BlurText as="div" delay={0.28} className="mt-9 inline-block">
          <a
            href="#start"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--primary-foreground)] px-7 text-sm font-medium text-[color:var(--sage-deep)] hover:opacity-90 transition-opacity"
          >
            Try the demo
            <ArrowRight className="size-4" strokeWidth={1.8} />
          </a>
        </BlurText>
      </div>
    </section>
  );
}
