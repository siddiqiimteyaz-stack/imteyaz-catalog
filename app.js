let allProducts = [];
let currentSlides = []; // अभी खुले हुए item की सारी images+videos
let currentSlideIndex = 0;

const grid = document.getElementById("grid");
const searchBox = document.getElementById("searchBox");
const emptyMsg = document.getElementById("emptyMsg");

const detailModal = document.getElementById("detailModal");
const closeDetailBtn = document.getElementById("closeDetailBtn");
const sliderTrack = document.getElementById("sliderTrack");
const sliderDots = document.getElementById("sliderDots");
const prevSlideBtn = document.getElementById("prevSlideBtn");
const nextSlideBtn = document.getElementById("nextSlideBtn");
const detailName = document.getElementById("detailName");
const detailPrice = document.getElementById("detailPrice");
const detailSize = document.getElementById("detailSize");
const detailNote = document.getElementById("detailNote");

// =========================
// Data लाना
// =========================
async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    grid.innerHTML = "<p style='color:#f66;'>डेटा लोड नहीं हो सका</p>";
    return;
  }
  allProducts = data || [];
  renderGrid(allProducts);
}

// =========================
// Grid दिखाना
// =========================
function renderGrid(list) {
  grid.innerHTML = "";
  emptyMsg.style.display = list.length === 0 ? "block" : "none";

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    const thumb = (p.images && p.images[0]) ? p.images[0] : "";
    card.innerHTML = `
      <img src="${thumb}" loading="lazy">
      <div class="cardName">${escapeHtml(p.name)}</div>
      ${p.price ? `<div class="cardPrice">${escapeHtml(p.price)}</div>` : ""}
    `;
    card.addEventListener("click", () => openDetail(p));
    grid.appendChild(card);
  });
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

// =========================
// Search (नाम + tags दोनों में)
// =========================
searchBox.addEventListener("input", () => {
  const q = searchBox.value.trim().toLowerCase();
  if (!q) {
    renderGrid(allProducts);
    return;
  }
  const filtered = allProducts.filter(p => {
    const haystack = ((p.name || "") + " " + (p.tags || "")).toLowerCase();
    return haystack.includes(q);
  });
  renderGrid(filtered);
});

// =========================
// Detail खोलना (Slider सहित)
// =========================
function openDetail(p) {
  detailName.textContent = p.name || "";
  detailPrice.textContent = p.price ? `💰 ${p.price}` : "";
  detailSize.textContent = p.size ? `📏 Size: ${p.size}` : "";
  detailNote.textContent = p.note || "";

  currentSlides = [
    ...(p.images || []).map(url => ({ type: "image", url })),
    ...(p.videos || []).map(url => ({ type: "video", url })),
  ];
  currentSlideIndex = 0;

  renderSlider();
  detailModal.classList.add("show");
}

function renderSlider() {
  sliderTrack.innerHTML = "";
  sliderDots.innerHTML = "";

  if (currentSlides.length === 0) {
    sliderTrack.innerHTML = "<div style='color:#888;'>कोई फ़ोटो/वीडियो नहीं</div>";
    return;
  }

  currentSlides.forEach((slide, i) => {
    const slot = document.createElement("div");
    if (slide.type === "image") {
      const img = document.createElement("img");
      img.src = slide.url;
      slot.appendChild(img);
    } else {
      const vid = document.createElement("video");
      vid.src = slide.url;
      vid.controls = true;
      vid.playsInline = true;
      slot.appendChild(vid);
    }
    sliderTrack.appendChild(slot);

    const dot = document.createElement("span");
    if (i === currentSlideIndex) dot.classList.add("active");
    sliderDots.appendChild(dot);
  });

  scrollToSlide(currentSlideIndex);
}

function scrollToSlide(index) {
  currentSlideIndex = Math.max(0, Math.min(index, currentSlides.length - 1));
  sliderTrack.scrollTo({ left: currentSlideIndex * sliderTrack.clientWidth, behavior: "smooth" });
  document.querySelectorAll(".sliderDots span").forEach((d, i) => {
    d.classList.toggle("active", i === currentSlideIndex);
  });
  // पिछली slide का वीडियो हो तो रोक दें
  document.querySelectorAll(".sliderTrack video").forEach(v => v.pause());
}

prevSlideBtn.addEventListener("click", () => scrollToSlide(currentSlideIndex - 1));
nextSlideBtn.addEventListener("click", () => scrollToSlide(currentSlideIndex + 1));

closeDetailBtn.addEventListener("click", () => {
  detailModal.classList.remove("show");
  document.querySelectorAll(".sliderTrack video").forEach(v => v.pause());
});

// =========================
// Start
// =========================
loadProducts();
