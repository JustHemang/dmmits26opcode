"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;

    const tween = gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, ease: "none" });
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => tween.progress(self.progress),
    });

    return () => {
      st.kill();
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={bar}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-electric-500 via-sky-glow to-saffron-400 shadow-[0_0_12px_rgba(61,123,255,0.6)]"
      style={{ transform: "scaleX(0)" }}
      aria-hidden="true"
    />
  );
}
