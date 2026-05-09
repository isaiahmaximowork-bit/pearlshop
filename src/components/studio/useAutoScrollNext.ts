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
  // Wait for React to finish re-rendering and DOM to stabilize
  setTimeout(() => {
    const headerOffset = 140; // Increased offset to account for dynamic heights and sticky elements
    const rect = next.getBoundingClientRect();
    const top = rect.top + window.pageYOffset - headerOffset;
    
    window.scrollTo({ 
      top: Math.max(0, top), 
      behavior: "smooth" 
    });
  }, 100);
}

export function handleSelectAndScroll(e: React.MouseEvent | React.SyntheticEvent) {
  scrollToNextSection(e.currentTarget as HTMLElement);
}
