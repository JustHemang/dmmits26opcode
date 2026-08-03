"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "warm" | "danger";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "sm" | "md" | "lg" }) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-electric-500 to-sky-glow text-white shadow-glow-blue hover:shadow-[0_0_50px_-6px_rgba(61,123,255,0.8)] hover:brightness-110",
    secondary:
      "glass text-navy-100 hover:bg-white/10 hover:border-electric-400/40",
    ghost: "text-navy-200 hover:text-white hover:bg-white/5",
    outline: "border border-electric-400/50 text-electric-300 hover:bg-electric-500/10",
    warm: "bg-gradient-to-r from-saffron-500 to-brown-500 text-navy-950 font-semibold hover:brightness-110 shadow-[0_0_36px_-8px_rgba(255,153,51,0.6)]",
    danger: "bg-rose-glow/15 text-rose-300 border border-rose-glow/40 hover:bg-rose-glow/25",
  };
  const sizes = {
    sm: "h-9 px-3.5 text-sm gap-1.5",
    md: "h-11 px-5 text-sm gap-2",
    lg: "h-13 px-7 text-base gap-2.5",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium tracking-wide transition-all duration-200",
        "hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
  target,
  rel,
  onClick,
  ariaLabel,
}: {
  href: string;
  className?: string;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  target?: string;
  rel?: string;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-electric-500 to-sky-glow text-white shadow-glow-blue hover:shadow-[0_0_50px_-6px_rgba(61,123,255,0.8)] hover:brightness-110",
    secondary: "glass text-navy-100 hover:bg-white/10 hover:border-electric-400/40",
    ghost: "text-navy-200 hover:text-white hover:bg-white/5",
    outline: "border border-electric-400/50 text-electric-300 hover:bg-electric-500/10",
    warm: "bg-gradient-to-r from-saffron-500 to-brown-500 text-navy-950 font-semibold hover:brightness-110 shadow-[0_0_36px_-8px_rgba(255,153,51,0.6)]",
    danger: "bg-rose-glow/15 text-rose-300 border border-rose-glow/40 hover:bg-rose-glow/25",
  };
  const sizes = {
    sm: "h-9 px-3.5 text-sm gap-1.5",
    md: "h-11 px-5 text-sm gap-2",
    lg: "h-13 px-7 text-base gap-2.5",
  };
  return (
    <motion.a
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium tracking-wide transition-all duration-200 cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </motion.a>
  );
}

export function Badge({ children, className, tone = "blue" }: { children: ReactNode; className?: string; tone?: "blue" | "warm" | "green" | "red" | "neutral" }) {
  const tones = {
    blue: "bg-electric-500/15 text-electric-300 border-electric-400/30",
    warm: "bg-saffron-500/15 text-saffron-300 border-saffron-500/30",
    green: "bg-mint-400/15 text-mint-400 border-mint-400/30",
    red: "bg-rose-glow/15 text-rose-300 border-rose-glow/30",
    neutral: "bg-white/8 text-navy-200 border-white/10",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function GlassCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass rounded-2xl", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
  warm,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  warm?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className={cn("max-w-2xl", center && "mx-auto text-center")}
    >
      {eyebrow && (
        <span className={cn("mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]", warm ? "text-saffron-400" : "text-electric-300")}>
          <span className="h-px w-6 bg-current" /> {eyebrow}
        </span>
      )}
      <h2 className={cn("text-3xl font-bold tracking-tight text-white sm:text-4xl", warm ? "text-gradient-warm" : "text-gradient")}>{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-navy-300">{subtitle}</p>}
    </motion.div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-navy-400",
        "transition-colors hover:border-white/20 focus:border-electric-400 focus:bg-white/8 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 pr-9 text-sm text-white transition-colors",
        "hover:border-white/20 focus:border-electric-400 focus:outline-none [&>option]:bg-navy-900",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-navy-400",
        "transition-colors hover:border-white/20 focus:border-electric-400 focus:bg-white/8 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy-200">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-navy-400">{hint}</span>}
    </label>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-white/5", className)} aria-hidden="true">
      <div className="shimmer-bar absolute inset-0 animate-shimmer" />
    </div>
  );
}

export function Logo({ size = "md", showText = true }: { size?: "sm" | "md" | "lg"; showText?: boolean }) {
  const s = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const text = size === "lg" ? "text-xl" : "text-base";
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={cn("relative grid place-items-center rounded-xl bg-gradient-to-br from-electric-500 to-sky-glow text-white shadow-glow-blue", s)}>
        <Icon name="Rocket" size={size === "lg" ? 24 : size === "sm" ? 17 : 19} />
      </span>
      {showText && (
        <span className={cn("font-bold tracking-tight", text)}>
          <span className="text-white">Skill India</span> <span className="text-gradient">Hub</span>
        </span>
      )}
    </span>
  );
}
