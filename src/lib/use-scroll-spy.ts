import { useEffect, useState } from "react";

// Which section is under the reading line, and how far down the page we are.
// Sections are found by their `data-sec` attribute, so the order on the page
// is the order of the trail.
export function useScrollSpy(ids: readonly string[]) {
  const [state, setState] = useState({ index: 0, progress: 0 });
  const key = ids.join("|");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let index = 0;
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < line) index = i;
      });
      const room = document.documentElement.scrollHeight - window.innerHeight;
      // A short last section never reaches the reading line, so the end of the page counts as it.
      if (room > 0 && window.scrollY >= room - 4) index = ids.length - 1;
      const progress = room > 0 ? Math.min(1, window.scrollY / room) : 0;
      setState((prev) =>
        prev.index === index && Math.abs(prev.progress - progress) < 0.004
          ? prev
          : { index, progress },
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}

// Jump to a section. Its scroll margin (set in CSS) keeps it clear of the header.
export function goToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

export function scrollToTop() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  history.replaceState(null, "", window.location.pathname + window.location.search);
}
