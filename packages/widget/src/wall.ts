(function () {
  "use strict";

  interface Testimonial {
    id: string;
    name: string;
    email: string;
    company?: string;
    role?: string;
    rating: number;
    text: string;
    avatarUrl?: string;
    createdAt: string;
  }

  // Get origin from script src
  function getOrigin(scriptEl: HTMLOrSVGScriptElement | null): string {
    if (scriptEl && (scriptEl as HTMLScriptElement).src) {
      try {
        return new URL((scriptEl as HTMLScriptElement).src).origin;
      } catch (_) {}
    }
    return (window as any).TestimonialKit?.origin || "";
  }

  const currentScript =
    document.currentScript ||
    (document.querySelector("script[src*='wall.js']") as HTMLScriptElement);
  const origin = getOrigin(currentScript);

  // Helper: get initials
  function initials(name: string): string {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  // Helper: stars HTML
  function starsHtml(rating: number): string {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      html += `<span style="color:${i <= rating ? "#f59e0b" : "#d1d5db"}">★</span>`;
    }
    return html;
  }

  // Helper: card HTML
  function cardHtml(t: Testimonial, dark: boolean): string {
    const bg = dark ? "#1f2937" : "#ffffff";
    const textColor = dark ? "#f9fafb" : "#111827";
    const subColor = dark ? "#9ca3af" : "#6b7280";
    const borderColor = dark ? "#374151" : "#e5e7eb";
    const avatarColors = ["#0d9488", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];
    const colorIdx = t.name.charCodeAt(0) % avatarColors.length;
    const avatarBg = avatarColors[colorIdx];

    return `
      <div class="tk-card" style="background:${bg};border:1px solid ${borderColor};border-radius:12px;padding:20px;break-inside:avoid;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          ${
            t.avatarUrl
              ? `<img src="${escapeHtml(t.avatarUrl)}" alt="${escapeHtml(t.name)}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;" />`
              : `<div style="width:44px;height:44px;border-radius:50%;background:${avatarBg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;">${initials(t.name)}</div>`
          }
          <div>
            <div style="font-weight:600;color:${textColor};font-size:14px;">${escapeHtml(t.name)}</div>
            ${t.company || t.role ? `<div style="color:${subColor};font-size:12px;">${escapeHtml([t.role, t.company].filter(Boolean).join(" @ "))}</div>` : ""}
          </div>
        </div>
        <div style="margin-bottom:8px;">${starsHtml(t.rating)}</div>
        <p style="color:${textColor};font-size:14px;line-height:1.6;margin:0;">"${escapeHtml(t.text)}"</p>
      </div>
    `;
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function initWall(container: HTMLElement) {
    const workspaceId = container.getAttribute("data-workspace-id");
    if (!workspaceId) return;

    const type = container.getAttribute("data-type") || "wall";
    const dark = container.getAttribute("data-theme") === "dark";
    const bg = dark ? "#111827" : "#f9fafb";
    const textColor = dark ? "#f9fafb" : "#111827";

    container.innerHTML = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${textColor};background:${bg};padding:16px;border-radius:16px;">Loading testimonials...</div>`;

    try {
      const fetchOrigin = origin || window.location.origin;
      const res = await fetch(`${fetchOrigin}/api/testimonials/public?workspaceId=${encodeURIComponent(workspaceId)}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json() as { testimonials: Testimonial[] };
      const testimonials = data.testimonials || [];

      if (testimonials.length === 0) {
        container.innerHTML = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${textColor};text-align:center;padding:40px;background:${bg};border-radius:16px;">No testimonials yet.</div>`;
        return;
      }

      if (type === "card") {
        // Single featured testimonial
        const featured = testimonials.find((t) => t) || testimonials[0];
        container.innerHTML = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;">${cardHtml(featured, dark)}</div>`;
        return;
      }

      if (type === "slider") {
        // Auto-rotating carousel
        let idx = 0;
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:${bg};padding:16px;border-radius:16px;position:relative;overflow:hidden;`;

        const slide = document.createElement("div");
        slide.innerHTML = cardHtml(testimonials[idx], dark);
        wrapper.appendChild(slide);

        // Dots
        const dots = document.createElement("div");
        dots.style.cssText = "display:flex;justify-content:center;gap:6px;margin-top:8px;";
        testimonials.slice(0, 8).forEach((_, i) => {
          const dot = document.createElement("span");
          dot.style.cssText = `width:8px;height:8px;border-radius:50%;background:${i === 0 ? "#0d9488" : "#d1d5db"};display:inline-block;cursor:pointer;transition:background .2s;`;
          dot.addEventListener("click", () => {
            idx = i;
            slide.innerHTML = cardHtml(testimonials[idx], dark);
            updateDots();
          });
          dots.appendChild(dot);
        });

        function updateDots() {
          Array.from(dots.children).forEach((d, i) => {
            (d as HTMLElement).style.background = i === idx ? "#0d9488" : "#d1d5db";
          });
        }

        wrapper.appendChild(dots);
        container.innerHTML = "";
        container.appendChild(wrapper);

        // Auto-rotate every 4s
        setInterval(() => {
          idx = (idx + 1) % Math.min(testimonials.length, 8);
          slide.style.opacity = "0";
          slide.style.transition = "opacity .3s";
          setTimeout(() => {
            slide.innerHTML = cardHtml(testimonials[idx], dark);
            slide.style.opacity = "1";
            updateDots();
          }, 300);
        }, 4000);
        return;
      }

      // Wall (masonry grid)
      const style = document.createElement("style");
      style.textContent = `
        .tk-wall-grid {
          columns: 3 280px;
          column-gap: 16px;
          padding: 16px;
        }
        @media (max-width: 640px) { .tk-wall-grid { columns: 1; } }
        @media (max-width: 900px) and (min-width: 641px) { .tk-wall-grid { columns: 2; } }
      `;
      document.head.appendChild(style);

      const grid = document.createElement("div");
      grid.className = "tk-wall-grid";
      grid.style.cssText = `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:${bg};border-radius:16px;`;
      grid.innerHTML = testimonials.map((t) => cardHtml(t, dark)).join("");
      container.innerHTML = "";
      container.appendChild(grid);
    } catch (err) {
      container.innerHTML = `<div style="color:#ef4444;padding:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Failed to load testimonials.</div>`;
    }
  }

  // Initialize all wall containers
  function init() {
    const containers = document.querySelectorAll<HTMLElement>("[data-testimonialkit-wall]");
    containers.forEach((c) => initWall(c));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
