(()=>{(function(){"use strict";function x(){let e=document.querySelectorAll("script[data-api-key]");for(let a=0;a<e.length;a++){let s=e[a].getAttribute("data-api-key");if(s)return s}return window.TestimonialKit&&window.TestimonialKit.apiKey?window.TestimonialKit.apiKey:null}function g(){var a;let e=document.querySelectorAll("script[data-api-key]");for(let s=0;s<e.length;s++){let n=e[s].src;if(n)try{return new URL(n).origin}catch(i){}}return((a=window.TestimonialKit)==null?void 0:a.origin)||""}let b=x();if(!b)return;let v=g(),f=document.createElement("style");f.textContent=`
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
  `,document.head.appendChild(f);let o=document.createElement("button");o.id="tk-btn",o.innerHTML="<span>\u2605</span> Leave a review",document.body.appendChild(o);let r=document.createElement("div");r.id="tk-overlay",document.body.appendChild(r);let t=document.createElement("div");t.id="tk-panel",t.innerHTML=`
    <div class="tk-header">
      <h2>Leave a Review</h2>
      <p>We'd love to hear your feedback!</p>
      <button class="tk-close" id="tk-close">\xD7</button>
    </div>
    <div class="tk-body" id="tk-form-body">
      <div class="tk-field">
        <label class="tk-label">Rating <span class="tk-required">*</span></label>
        <div class="tk-stars" id="tk-stars">
          <span class="tk-star" data-val="1">\u2605</span>
          <span class="tk-star" data-val="2">\u2605</span>
          <span class="tk-star" data-val="3">\u2605</span>
          <span class="tk-star" data-val="4">\u2605</span>
          <span class="tk-star" data-val="5">\u2605</span>
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
  `,document.body.appendChild(t);let p=5,u=t.querySelectorAll(".tk-star");function m(e){p=e,u.forEach(a=>{let s=parseInt(a.getAttribute("data-val")||"0");a.classList.toggle("active",s<=e)})}m(5),u.forEach(e=>{e.addEventListener("click",()=>{m(parseInt(e.getAttribute("data-val")||"5"))}),e.addEventListener("mouseenter",()=>{let a=parseInt(e.getAttribute("data-val")||"0");u.forEach(s=>{let n=parseInt(s.getAttribute("data-val")||"0");s.classList.toggle("active",n<=a)})})}),t.querySelector("#tk-stars").addEventListener("mouseleave",()=>{m(p)});function h(){r.classList.add("tk-show"),t.classList.add("tk-show"),document.body.style.overflow="hidden"}function k(){r.classList.remove("tk-show"),t.classList.remove("tk-show"),document.body.style.overflow=""}o.addEventListener("click",h),r.addEventListener("click",k),t.querySelector("#tk-close").addEventListener("click",k),t.querySelector("#tk-submit").addEventListener("click",async()=>{let e=t.querySelector("#tk-name").value.trim(),a=t.querySelector("#tk-email").value.trim(),s=t.querySelector("#tk-company").value.trim(),n=t.querySelector("#tk-role").value.trim(),i=t.querySelector("#tk-message").value.trim(),l=t.querySelector("#tk-form-error"),y=t.querySelector("#tk-msg-error"),c=t.querySelector("#tk-submit");if(l.textContent="",y.textContent="",!e){l.textContent="Name is required.";return}if(!a||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)){l.textContent="Valid email is required.";return}if(!i||i.length<20){y.textContent="Message must be at least 20 characters.";return}c.disabled=!0,c.textContent="Submitting...";try{let d=await fetch(`${v}/api/testimonials`,{method:"POST",headers:{"Content-Type":"application/json","X-API-Key":b},body:JSON.stringify({name:e,email:a,company:s||void 0,role:n||void 0,rating:p,text:i,source:"widget"})});if(!d.ok){let E=await d.json().catch(()=>({}));throw new Error(E.error||"Submission failed")}let w=t.querySelector("#tk-form-body");w.innerHTML=`
        <div class="tk-success">
          <div class="tk-success-icon">\u{1F389}</div>
          <h3>Thank you!</h3>
          <p>Your testimonial is under review. We appreciate your feedback!</p>
        </div>
      `,setTimeout(k,3e3)}catch(d){l.textContent=d.message||"Something went wrong. Please try again.",c.disabled=!1,c.textContent="Submit Review"}})})();})();
