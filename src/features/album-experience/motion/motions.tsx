import { motion, useReducedMotion } from "framer-motion";
import type { MotionRendererProps } from "../runtime/types";

export function NoMotion({ children, className }: MotionRendererProps) {
  return <div className={className}>{children}</div>;
}

export function GentleReveal({ children, className }: MotionRendererProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SlowZoom({ children, className }: MotionRendererProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, scale: 1.035 }}
      whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function BlurToFocus({ children, className }: MotionRendererProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0.45, filter: "blur(14px)", scale: 1.015 }}
      whileInView={reduced ? undefined : { opacity: 1, filter: "blur(0px)", scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function DepthReveal({ children, className }: MotionRendererProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, scale: 0.96, y: 45 }}
      whileInView={reduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function HorizontalDrift({ children, className }: MotionRendererProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, x: "6vw" }}
      whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function CameraFlash({ children, className }: MotionRendererProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, filter: "brightness(2.4) saturate(0)" }}
      whileInView={
        reduced ? undefined : { opacity: [0, 1, 0.82, 1], filter: "brightness(1) saturate(1)" }
      }
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.48, times: [0, 0.18, 0.42, 1], ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function ExposureReveal({ children, className }: MotionRendererProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0.15, filter: "brightness(0.35) contrast(1.25)" }}
      whileInView={reduced ? undefined : { opacity: 1, filter: "brightness(1) contrast(1)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function ClipReveal({ children, className }: MotionRendererProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
      whileInView={reduced ? undefined : { clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function RiseAndSettle({ children, className }: MotionRendererProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 72, rotate: -0.6 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ type: "spring", stiffness: 58, damping: 18, mass: 0.9 }}
    >
      {children}
    </motion.div>
  );
}
