import { motion } from "framer-motion";
import type { TransitionRendererProps } from "../runtime/types";

export function CutTransition({ children }: TransitionRendererProps) {
  return <>{children}</>;
}

export function CrossfadeTransition({
  children,
  durationMs,
  reducedMotion,
}: TransitionRendererProps) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      whileInView={reducedMotion ? undefined : { opacity: 1 }}
      viewport={{ once: true, amount: 0.06 }}
      transition={{ duration: seconds(durationMs), ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function DipToBlackTransition({
  children,
  durationMs,
  reducedMotion,
}: TransitionRendererProps) {
  return (
    <motion.div
      className="bg-black"
      initial={reducedMotion ? false : { opacity: 0 }}
      whileInView={reducedMotion ? undefined : { opacity: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: seconds(durationMs), ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function WipeTransition({ children, durationMs, reducedMotion }: TransitionRendererProps) {
  return (
    <motion.div
      initial={reducedMotion ? false : { clipPath: "inset(0 0 0 100%)" }}
      whileInView={reducedMotion ? undefined : { clipPath: "inset(0 0 0 0%)" }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: seconds(durationMs), ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function DissolveTransition({
  children,
  durationMs,
  reducedMotion,
}: TransitionRendererProps) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, filter: "blur(10px)" }}
      whileInView={reducedMotion ? undefined : { opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: seconds(durationMs), ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function SlideOverTransition({
  children,
  durationMs,
  reducedMotion,
}: TransitionRendererProps) {
  return (
    <motion.div
      initial={reducedMotion ? false : { x: "8vw", opacity: 0.7 }}
      whileInView={reducedMotion ? undefined : { x: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: seconds(durationMs), ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function FlashTransition({ children, durationMs, reducedMotion }: TransitionRendererProps) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0.2, filter: "brightness(2.5)" }}
      whileInView={reducedMotion ? undefined : { opacity: 1, filter: "brightness(1)" }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: seconds(durationMs), ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function PageTurnTransition({
  children,
  durationMs,
  reducedMotion,
}: TransitionRendererProps) {
  return (
    <div className="[perspective:1400px]">
      <motion.div
        className="origin-left"
        initial={reducedMotion ? false : { rotateY: -8, opacity: 0.4 }}
        whileInView={reducedMotion ? undefined : { rotateY: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: seconds(durationMs), ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function seconds(durationMs: number): number {
  return Math.max(0.1, Math.min(durationMs / 1_000, 2.5));
}
