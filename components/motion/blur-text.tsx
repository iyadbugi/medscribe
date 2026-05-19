"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type Tag = "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type BlurTextProps = {
  as?: Tag;
  delay?: number;
  duration?: number;
  className?: string;
  children: ReactNode;
};

export function BlurText({
  as = "span",
  delay = 0,
  duration = 0.8,
  className,
  children,
}: BlurTextProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ margin: "-10% 0px" }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}
