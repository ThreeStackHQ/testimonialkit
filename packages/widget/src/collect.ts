(function () {
  "use strict";

  // Get API key from script tag or global config
  function getApiKey(): string | null {
    const scripts = document.querySelectorAll("script[data-api-key]");
    for (let i = 0; i < scripts.length; i++) {
      const key = (scripts[i] as HTMLScriptElement).getAttribute("data-api-key");
      if (key) return key;
    }
    if ((window as any).TestimonialKit && (window as any).TestimonialKit.apiKey) {
      return (window as any).TestimonialKit.apiKey;
    }
    return null;
  }

  // Get origin from script src
  function getOrigin(): string {
    const scripts = document.querySelectorAll("script[data-api-key]");
    for (let i = 0; i < scripts.length; i++) {
      const src = (scripts[i] as HTMLScriptElement).src;
      if (src) {
        try {
          const url = new URL(src);
          return url.origin;
        } catch (_) {}
      }
    }
    return (window as any).TestimonialKit?.origin || "";
  }

  const apiKey = getApiKey();
  if (!apiKey) return;

  const origin = getOrigin();

  // Styles
  const style = document.createElement("style");
  style.textContent = `
    #tk-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: #0d9488;
      color: #fff;
      border: none;
      border-radius: 50px;
      padding: 12px 20px;
      font-size: 14px;
      font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(13,148,136,0.4);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: transform .15s, box-shadow .15s;
    }
    #tk-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(13,148,136,0.5); }
    #tk-overlay {
      position: fixed;
      inset: 0;
      z-index: 999998;
      background: rgba(0,0,0,.45);
      opacity: 0;
      transition: opacity .2s;
    }
    #tk-overlay.tk-show { opacity: 1; }
    #tk-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 999999;
      width: 380px;
      max-width: 100vw;
      background: #fff;
      box-shadow: -4px 0 24px rgba(0,0,0,.15);
      transform: translateX(100%);
      transition: transform .25s cubic-bezier(.4,0,.2,1);
      overflow-y: auto;
      font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    }
    #tk-panel.tk-show { transform: translateX(0); }
    .tk-header {
      background: #0d9488;
      color: #fff;
      padding: 20px 24px;
    }
    .tk-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
    .tk-header p { margin: 4px 0 0; font-size: 13px; opacity: .85; }
    .tk-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(255,255,255,.2);
      border: none;
      color: #fff;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .tk-body { padding: 24px; }
    .tk-field { margin-bottom: 16px; }
    .tk-label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
    .tk-required { color: #ef4444; }
    .tk-input, .tk-textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: border-color .15s;
      box-sizing: border-box;
      color: #111827;
    }
    .tk-input:focus, .tk-textarea:focus { border-color: #0d9488; }
    .tk-textarea { resize: vertical; min-height: 100px; }
    .tk-stars { display: flex; gap: 6px; }
    .tk-star {
      font-size: 28px;
      cursor: pointer;
      color: #d1d5db;
      transition: color .1s;
    }
    .tk-star.active { color: #f59e0b; }
    .tk-submit {
      width: 100%;
      padding: 12px;
      background: #0d9488;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background .15s;
    }
    .tk-submit:hover { background: #0f766e; }
    .tk-submit:disabled { opacity: .7; cursor: default; }
    .tk-error { color: #ef4444; font-size: 12px; margin-top: 4px; }
    .tk-success {
      text-align: center;
      padding: 40px 24px;
      color: #374151;
    }
    .tk-success-icon { font-size: 48px; margin-bottom: 12px; }
    .tk-success h3 { font-size: 20px; color: #0d9488; margin: 0 0 8px; }
    .tk-success p { font-size: 14px; margin: 0; opacity: .7; }
  `;
  document.head.appendChild(style);

  // Floating button
  const btn = document.createElement("button");
  btn.id = "tk-btn";
  btn.innerHTML = `<span>★</span> Leave a review`;
  document.body.appendChild(btn);

  // Overlay
  const overlay = document.createElement("div");
  overlay.id = "tk-overlay";
  document.body.appendChild(overlay);

  // Panel
  const panel = document.createElement("div");
  panel.id = "tk-panel";
  panel.innerHTML = `
    <div class="tk-header">
      <h2>Leave a Review</h2>
      <p>We'd love to hear your feedback!</p>
      <button class="tk-close" id="tk-close">×</button>
    </div>
    <div class="tk-body" id="tk-form-body">
      <div class="tk-field">
        <label class="tk-label">Rating <span class="tk-required">*</span></label>
        <div class="tk-stars" id="tk-stars">
          <span class="tk-star" data-val="1">★</span>
          <span class="tk-star" data-val="2">★</span>
          <span class="tk-star" data-val="3">★</span>
          <span class="tk-star" data-val="4">★</span>
          <span class="tk-star" data-val="5">★</span>
        </div>
      </div>
      <div class="tk-field">
        <label class="tk-label">Name <span class="tk-required">*</span></label>
        <input class="tk-input" id="tk-name" type="text" placeholder="Your name" />
      </div>
      <div class="tk-field">
        <label class="tk-label">Email <span class="tk-required">*</span></label>
        <input class="tk-input" id="tk-email" type="email" placeholder="you@example.com" />
      </div>
      <div class="tk-field">
        <label class="tk-label">Company</label>
        <input class="tk-input" id="tk-company" type="text" placeholder="Acme Inc." />
      </div>
      <div class="tk-field">
        <label class="tk-label">Role</label>
        <input class="tk-input" id="tk-role" type="text" placeholder="CEO, Developer..." />
      </div>
      <div class="tk-field">
        <label class="tk-label">Message <span class="tk-required">*</span></label>
        <textarea class="tk-textarea" id="tk-message" placeholder="Share your experience (min 20 characters)..."></textarea>
        <div class="tk-error" id="tk-msg-error"></div>
      </div>
      <div class="tk-error" id="tk-form-error"></div>
      <button class="tk-submit" id="tk-submit">Submit Review</button>
    </div>
  `;
  document.body.appendChild(panel);

  let selectedRating = 5;
  const stars = panel.querySelectorAll<HTMLElement>(".tk-star");

  // Set default rating
  function setRating(val: number) {
    selectedRating = val;
    stars.forEach((s) => {
      const starVal = parseInt(s.getAttribute("data-val") || "0");
      s.classList.toggle("active", starVal <= val);
    });
  }
  setRating(5);

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      setRating(parseInt(star.getAttribute("data-val") || "5"));
    });
    star.addEventListener("mouseenter", () => {
      const val = parseInt(star.getAttribute("data-val") || "0");
      stars.forEach((s) => {
        const sv = parseInt(s.getAttribute("data-val") || "0");
        s.classList.toggle("active", sv <= val);
      });
    });
  });

  (panel.querySelector("#tk-stars") as HTMLElement).addEventListener("mouseleave", () => {
    setRating(selectedRating);
  });

  function openPanel() {
    overlay.classList.add("tk-show");
    panel.classList.add("tk-show");
    document.body.style.overflow = "hidden";
  }

  function closePanel() {
    overlay.classList.remove("tk-show");
    panel.classList.remove("tk-show");
    document.body.style.overflow = "";
  }

  btn.addEventListener("click", openPanel);
  overlay.addEventListener("click", closePanel);
  panel.querySelector("#tk-close")!.addEventListener("click", closePanel);

  (panel.querySelector("#tk-submit") as HTMLButtonElement).addEventListener("click", async () => {
    const name = (panel.querySelector("#tk-name") as HTMLInputElement).value.trim();
    const email = (panel.querySelector("#tk-email") as HTMLInputElement).value.trim();
    const company = (panel.querySelector("#tk-company") as HTMLInputElement).value.trim();
    const role = (panel.querySelector("#tk-role") as HTMLInputElement).value.trim();
    const message = (panel.querySelector("#tk-message") as HTMLTextAreaElement).value.trim();
    const formError = panel.querySelector("#tk-form-error") as HTMLElement;
    const msgError = panel.querySelector("#tk-msg-error") as HTMLElement;
    const submitBtn = panel.querySelector("#tk-submit") as HTMLButtonElement;

    formError.textContent = "";
    msgError.textContent = "";

    if (!name) { formError.textContent = "Name is required."; return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { formError.textContent = "Valid email is required."; return; }
    if (!message || message.length < 20) { msgError.textContent = "Message must be at least 20 characters."; return; }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      const res = await fetch(`${origin}/api/testimonials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({
          name,
          email,
          company: company || undefined,
          role: role || undefined,
          rating: selectedRating,
          text: message,
          source: "widget",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || "Submission failed");
      }

      const body = panel.querySelector("#tk-form-body") as HTMLElement;
      body.innerHTML = `
        <div class="tk-success">
          <div class="tk-success-icon">🎉</div>
          <h3>Thank you!</h3>
          <p>Your testimonial is under review. We appreciate your feedback!</p>
        </div>
      `;
      setTimeout(closePanel, 3000);
    } catch (err: any) {
      formError.textContent = err.message || "Something went wrong. Please try again.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Review";
    }
  });
})();
