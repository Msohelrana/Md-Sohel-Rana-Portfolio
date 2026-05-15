// Current year in footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Reveal sections on scroll
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
  { threshold: 0.12 }
);
targets.forEach(el => io.observe(el));

// Lightbox (only present on the Projects page)
const lb = document.getElementById("lightbox");
if (lb) {
  const lbContent = lb.querySelector(".lb-content");
  const lbClose = lb.querySelector(".lb-close");

  const openLightbox = (type, src) => {
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
  };
  const closeLightbox = () => {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    lbContent.innerHTML = "";
  };

  document.querySelectorAll("[data-lightbox]").forEach(el => {
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
        const restore = () => {
          el.classList.remove("playing");
          el.innerHTML = originalHTML;
        };
        video.addEventListener("ended", restore);
        el.innerHTML = "";
        el.appendChild(video);
        return;
      }
      // Everything else (gallery thumbs): open lightbox
      openLightbox(el.dataset.type, el.dataset.src);
    });
  });
  lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });
}

// Tilt cards on pointer move (subtle, playful)
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
