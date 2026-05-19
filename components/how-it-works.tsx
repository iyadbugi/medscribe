"use client";

import { motion } from "motion/react";
import { BlurText } from "@/components/motion/blur-text";
import { Section, Container } from "@/components/section";

const steps = [
  {
    n: 1,
    title: "Capture",
    desc: "Dictate after the visit. Three minutes is plenty.",
  },
  {
    n: 2,
    title: "Transcribe",
    desc: "Whisper turns the dictation into a clean transcript.",
  },
  {
    n: 3,
    title: "Draft",
    desc: "The model writes a SOAP note and a plain-English handout.",
  },
  {
    n: 4,
    title: "Review",
    desc: "Read, edit, export. Nothing leaves until you say so.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how" className="bg-cream-blend min-h-[118svh] pb-20 sm:pb-16 md:min-h-[100svh] md:pb-0">
      <Container>
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-6"
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--sage-deep)]/80">
            How it works
          </span>

          <BlurText
            as="h2"
            delay={0.08}
            className="font-display text-4xl leading-[1.02] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl"
          >
            Four steps,{" "}
            <span className="font-display-italic">finished</span>
            <br />
            before your coffee gets cold.
          </BlurText>

          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            MedScribe is built for the moment right after a patient leaves the
            room — when memory is sharpest and time is shortest.
          </p>

          <motion.a
            href="#start"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="self-start cursor-pointer rounded-full bg-[color:var(--sage-deep)] px-10 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--primary-foreground)] transition-colors hover:bg-[color-mix(in_oklch,var(--sage-deep)_88%,white)]"
          >
            Start a Recording
          </motion.a>

          <p className="text-sm text-muted-foreground">
            Your patients&rsquo; data never leaves your device.
          </p>
        </motion.div>

        <div className="flex flex-col gap-10">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ margin: "-10% 0px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.07 * i }}
              className="flex items-start gap-5"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[color:var(--mint)] font-display text-lg text-[color:var(--sage-deep)] ring-1 ring-[color-mix(in_oklch,var(--sage-deep)_18%,transparent)]">
                {s.n}
              </span>
              <div className="flex flex-col gap-1 pt-1.5">
                <h3 className="font-display text-xl leading-tight tracking-[-0.03em] text-foreground sm:text-2xl">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      </Container>
    </Section>
  );
}
