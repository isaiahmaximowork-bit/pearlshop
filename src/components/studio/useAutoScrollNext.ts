// Helper to smooth-scroll to the next Studio section after a user picks an option.
// Usage: pass an event (or element ref) — finds the closest [data-studio-section]
// then scrolls the next sibling section into view.

export function scrollToNextSection(fromEl: HTMLElement | null) {
  if (!fromEl) return;
  const current = fromEl.closest<HTMLElement>("[data-studio-section]");
  if (!current) return;
  // Find next section in DOM order
  const all = Array.from(document.querySelectorAll<HTMLElement>("[data-studio-section]"));
  const idx = all.indexOf(current);
  const next = all[idx + 1];
  if (!next) return;
  // Wait a frame so selection state/animations don't fight the scroll
  requestAnimationFrame(() => {
    const headerOffset = 96; // account for sticky header + progress bar
    const top = next.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  });
}

export function handleSelectAndScroll(e: React.MouseEvent | React.SyntheticEvent) {
  scrollToNextSection(e.currentTarget as HTMLElement);
}
