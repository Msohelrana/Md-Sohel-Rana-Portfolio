// === Year in footer ===
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// === Globals shared by nav drawer + lightbox (history-state coordination) ===
const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const lb = document.getElementById("lightbox");
const lbContent = lb ? lb.querySelector(".lb-content") : null;
const lbClose = lb ? lb.querySelector(".lb-close") : null;

const setNavOpen = (open) => {
  if (!nav) return;
  nav.classList.toggle("open", open);
  if (navToggle) navToggle.setAttribute("aria-expanded", open ? "true" : "false");
};
const isLbOpen = () => lb && lb.classList.contains("open");
const isNavOpen = () => nav && nav.classList.contains("open");

const openLightbox = (type, src) => {
  if (!lb || !lbContent) return;
  lbContent.innerHTML = "";
  if (type === "video") {
    const v = document.createElement("video");
    v.src = src;
    v.controls = true;
    v.autoplay = true;
    v.playsInline = true;
    lbContent.appendChild(v);
  } else {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    lbContent.appendChild(img);
  }
  lb.classList.add("open");
  lb.setAttribute("aria-hidden", "false");
  history.pushState({ overlay: "lightbox" }, "");
};
const closeLightboxState = () => {
  if (!lb) return;
  lb.classList.remove("open");
  lb.setAttribute("aria-hidden", "true");
  if (lbContent) lbContent.innerHTML = "";
};
const closeLightbox = () => {
  if (!isLbOpen()) return;
  if (history.state && history.state.overlay === "lightbox") history.back();
  else closeLightboxState();
};

// === Nav drawer ===
if (nav && navToggle) {
  navToggle.addEventListener("click", e => {
    e.stopPropagation();
    if (isNavOpen()) {
      if (history.state && history.state.overlay === "nav") history.back();
      else setNavOpen(false);
    } else {
      setNavOpen(true);
      history.pushState({ overlay: "nav" }, "");
    }
  });
  document.querySelectorAll(".nav-menu a").forEach(a => {
    a.addEventListener("click", () => {
      if (isNavOpen() && history.state && history.state.overlay === "nav") history.back();
      else setNavOpen(false);
    });
  });
  nav.addEventListener("click", e => {
    if (e.target === nav && isNavOpen()) {
      if (history.state && history.state.overlay === "nav") history.back();
      else setNavOpen(false);
    }
  });
}

// === Lightbox close handlers ===
if (lb) {
  if (lbClose) {
    lbClose.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      closeLightbox();
    });
  }
  lb.addEventListener("click", e => {
    if (e.target === lb) {
      e.stopPropagation();
      closeLightbox();
    }
  });
}

// === Global Escape ===
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (isLbOpen()) closeLightbox();
  else if (isNavOpen()) {
    if (history.state && history.state.overlay === "nav") history.back();
    else setNavOpen(false);
  }
});

// === popstate: close whichever overlay is open ===
window.addEventListener("popstate", () => {
  if (isLbOpen()) closeLightboxState();
  if (isNavOpen()) setNavOpen(false);
});

// === Projects renderer — reads projects.json and builds the project section ===
const escapeHtml = (s) => String(s)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const renderStoreLinks = (p) => {
  const playHref = p.playStore || "#";
  const webglHref = p.webgl || "#";
  return `
    <div class="project-links">
      <a class="store-btn play" href="${escapeHtml(playHref)}" target="_blank" rel="noopener" aria-label="${escapeHtml(p.title)} on Google Play">
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M 3 2 L 13 8 L 3 14 Z"/></svg>
        Google Play
      </a>
      <a class="store-btn webgl" href="${escapeHtml(webglHref)}" target="_blank" rel="noopener" aria-label="Play ${escapeHtml(p.title)} in browser (WebGL)">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5"/>
          <path d="M 1.5 8 H 14.5"/>
          <path d="M 8 1.5 Q 12 8 8 14.5"/>
          <path d="M 8 1.5 Q 4 8 8 14.5"/>
        </svg>
        Play in Browser
      </a>
    </div>`;
};

const renderMediaBlock = (p) => {
  if (!p.hasMedia) return "";
  const slug = escapeHtml(p.slug);
  const title = escapeHtml(p.title);
  return `
    <div class="project-media">
      <div class="media-main" data-lightbox data-type="video" data-src="media/${slug}/video.mp4">
        <img src="media/${slug}/poster.jpg" loading="lazy" decoding="async" alt="${title} poster" />
        <div class="play-badge">▶</div>
      </div>
      <div class="media-gallery">
        <button class="thumb" data-lightbox data-type="image" data-src="media/${slug}/1.jpg">
          <img src="media/${slug}/1.jpg" alt="${title} screenshot 1" loading="lazy" />
        </button>
        <button class="thumb" data-lightbox data-type="image" data-src="media/${slug}/2.jpg">
          <img src="media/${slug}/2.jpg" alt="${title} screenshot 2" loading="lazy" />
        </button>
        <button class="thumb" data-lightbox data-type="image" data-src="media/${slug}/3.jpg">
          <img src="media/${slug}/3.jpg" alt="${title} screenshot 3" loading="lazy" />
        </button>
      </div>
    </div>`;
};

const renderProjectCard = (p) => {
  const stickerClass = p.stickerColor ? `sticker ${escapeHtml(p.stickerColor)}` : "sticker";
  const chips = (p.chips || []).map(c => `<span class="chip">${escapeHtml(c)}</span>`).join("\n          ");
  return `
    <article class="project">
      <span class="${stickerClass}">${escapeHtml(p.stickerText || "")}</span>
      <header class="project-head">
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.description)}</p>
        <div class="chips">
          ${chips}
        </div>
      </header>
      ${p.showStoreLinks ? renderStoreLinks(p) : ""}
      ${renderMediaBlock(p)}
    </article>`;
};

const renderProjects = (data) => {
  const container = document.getElementById("projects-container");
  if (!container) return;
  const projects = (data && data.projects) || [];
  // Group by subsection (in array order — first appearance defines order)
  const subOrder = [];
  const subMap = new Map();
  for (const p of projects) {
    const sub = p.subsection || "Projects";
    if (!subMap.has(sub)) { subMap.set(sub, []); subOrder.push(sub); }
    subMap.get(sub).push(p);
  }
  let html = "";
  for (const sub of subOrder) {
    html += `\n    <h3 class="subhead">${escapeHtml(sub)}</h3>\n`;
    for (const p of subMap.get(sub)) html += renderProjectCard(p);
  }
  container.innerHTML = html;
  // Wire up the click handlers on the freshly-rendered project DOM
  attachProjectClickHandlers(container);
  // Tell the IntersectionObserver to also observe the newly-rendered cards if needed
  // (the section itself is already observed; cards inherit visibility from it)
};

const attachProjectClickHandlers = (root) => {
  root.querySelectorAll("[data-lightbox]").forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      // Main project video: play inline inside the card
      if (el.classList.contains("media-main") && el.dataset.type === "video") {
        if (el.classList.contains("playing")) return;
        const originalHTML = el.innerHTML;
        el.classList.add("playing");
        const video = document.createElement("video");
        video.src = el.dataset.src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.addEventListener("ended", () => {
          el.classList.remove("playing");
          el.innerHTML = originalHTML;
        });
        el.innerHTML = "";
        el.appendChild(video);
        return;
      }
      openLightbox(el.dataset.type, el.dataset.src);
    });
  });
};

// === Skills renderer — reads skills.json and builds the Skills section ===
// Supports **bold** markdown-style emphasis inside items.
const renderSkillItem = (text) => {
  // escape HTML first, then apply **bold** transformation
  const safe = escapeHtml(text);
  return safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
};

const renderSkillCard = (c) => {
  const colorClass = c.color ? `skill-card ${escapeHtml(c.color)}` : "skill-card";
  const items = (c.items || []).map(it => `<li>${renderSkillItem(it)}</li>`).join("\n          ");
  return `
    <article class="${colorClass}">
      <span class="skill-tag">${escapeHtml(c.tag || "")}</span>
      <h3>${escapeHtml(c.name || "")}</h3>
      <ul>
          ${items}
      </ul>
    </article>`;
};

const renderSkills = (data) => {
  const container = document.getElementById("skills-container");
  if (!container) return;
  const cats = (data && data.categories) || [];
  container.innerHTML = cats.map(renderSkillCard).join("");
};

fetch("skills.json", { cache: "no-store" })
  .then(r => r.ok ? r.json() : Promise.reject(new Error("Cannot load skills.json")))
  .then(renderSkills)
  .catch(err => {
    const container = document.getElementById("skills-container");
    if (container) container.innerHTML = `<p class="projects-loading">⚠ Couldn't load skills.json — ${escapeHtml(err.message)}</p>`;
    console.error(err);
  });

// Fetch projects.json and render. Falls back gracefully if file is missing.
fetch("projects.json", { cache: "no-store" })
  .then(r => r.ok ? r.json() : Promise.reject(new Error("Cannot load projects.json")))
  .then(renderProjects)
  .catch(err => {
    const container = document.getElementById("projects-container");
    if (container) {
      container.innerHTML = `<p class="projects-loading">⚠ Couldn't load projects.json — ${escapeHtml(err.message)}</p>`;
    }
    console.error(err);
  });

// === Reveal sections on scroll ===
const targets = document.querySelectorAll(".section, .hero, .page");
targets.forEach(el => el.classList.add("reveal"));

const io = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0, rootMargin: "0px 0px -60px 0px" }
);
targets.forEach(el => io.observe(el));

// === Tilt cards on pointer move (subtle, playful) ===
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("pointermove", e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});
