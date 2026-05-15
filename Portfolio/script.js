// Current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Reveal sections on scroll
const targets = document.querySelectorAll(".section, .hero");
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

// Hover-to-play on project videos
document.querySelectorAll(".media-main video").forEach(v => {
  const parent = v.closest(".media-main");
  parent.addEventListener("pointerenter", () => v.play().catch(() => {}));
  parent.addEventListener("pointerleave", () => { v.pause(); v.currentTime = 0; });
});

// Lightbox
const lb = document.getElementById("lightbox");
const lbContent = lb.querySelector(".lb-content");
const lbClose = lb.querySelector(".lb-close");

function openLightbox(type, src) {
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
}
function closeLightbox() {
  lb.classList.remove("open");
  lb.setAttribute("aria-hidden", "true");
  lbContent.innerHTML = "";
}

document.querySelectorAll("[data-lightbox]").forEach(el => {
  el.addEventListener("click", e => {
    e.preventDefault();
    openLightbox(el.dataset.type, el.dataset.src);
  });
});
lbClose.addEventListener("click", closeLightbox);
lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

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
