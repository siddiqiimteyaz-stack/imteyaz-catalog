const nameInput = document.getElementById("nameInput");
const tagsInput = document.getElementById("tagsInput");
const priceInput = document.getElementById("priceInput");
const sizeInput = document.getElementById("sizeInput");
const noteInput = document.getElementById("noteInput");
const imagesInput = document.getElementById("imagesInput");
const videosInput = document.getElementById("videosInput");
const saveProductBtn = document.getElementById("saveProductBtn");
const uploadStatus = document.getElementById("uploadStatus");
const adminList = document.getElementById("adminList");
const adminSearchBox = document.getElementById("adminSearchBox");

let allAdminProducts = [];

// =========================
// फ़ाइल upload करके public URL पाना
// =========================
async function uploadFile(file) {
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`;
  const { error } = await supabaseClient.storage
    .from("catalog-media")
    .upload(path, file);

  if (error) throw error;

  const { data } = supabaseClient.storage
    .from("catalog-media")
    .getPublicUrl(path);

  return data.publicUrl;
}

// =========================
// Save Product
// =========================
saveProductBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  if (!name) {
    alert("नाम भरें");
    return;
  }

  saveProductBtn.disabled = true;
  uploadStatus.textContent = "⏳ Upload हो रहा है, रुकें...";

  try {
    const imageFiles = Array.from(imagesInput.files);
    const videoFiles = Array.from(videosInput.files);

    const imageUrls = [];
    for (const f of imageFiles) {
      uploadStatus.textContent = `⏳ Image अपलोड हो रही है: ${f.name}`;
      imageUrls.push(await uploadFile(f));
    }

    const videoUrls = [];
    for (const f of videoFiles) {
      uploadStatus.textContent = `⏳ Video अपलोड हो रही है: ${f.name}`;
      videoUrls.push(await uploadFile(f));
    }

    const { error } = await supabaseClient.from("products").insert({
      name,
      tags: tagsInput.value.trim(),
      price: priceInput.value.trim(),
      size: sizeInput.value.trim(),
      note: noteInput.value.trim(),
      images: imageUrls,
      videos: videoUrls,
    });

    if (error) throw error;

    uploadStatus.textContent = "✅ Item सेव हो गया";
    nameInput.value = "";
    tagsInput.value = "";
    priceInput.value = "";
    sizeInput.value = "";
    noteInput.value = "";
    imagesInput.value = "";
    videosInput.value = "";
    loadAdminList();
  } catch (err) {
    console.error(err);
    uploadStatus.textContent = "❌ समस्या: " + err.message;
  } finally {
    saveProductBtn.disabled = false;
  }
});

// =========================
// मौजूदा Items की List
// =========================
async function loadAdminList() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }
  allAdminProducts = data || [];
  renderAdminList(allAdminProducts);
}

function renderAdminList(list) {
  adminList.innerHTML = "";
  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "adminItem";
    const thumb = (p.images && p.images[0]) ? p.images[0] : "";
    div.innerHTML = `
      <img src="${thumb}">
      <div class="info">
        <div class="n">${escapeHtml(p.name)}</div>
        <div class="p">${escapeHtml(p.price || "")}</div>
      </div>
      <button data-id="${p.id}">Delete</button>
    `;
    div.querySelector("button").addEventListener("click", () => deleteProduct(p.id));
    adminList.appendChild(div);
  });
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

async function deleteProduct(id) {
  if (!confirm("पक्का इसे हटाना है?")) return;
  const { error } = await supabaseClient.from("products").delete().eq("id", id);
  if (error) {
    alert("Delete नहीं हो सका: " + error.message);
    return;
  }
  loadAdminList();
}

adminSearchBox.addEventListener("input", () => {
  const q = adminSearchBox.value.trim().toLowerCase();
  if (!q) {
    renderAdminList(allAdminProducts);
    return;
  }
  const filtered = allAdminProducts.filter(p => {
    const haystack = ((p.name || "") + " " + (p.tags || "")).toLowerCase();
    return haystack.includes(q);
  });
  renderAdminList(filtered);
});

// =========================
// Start
// =========================
loadAdminList();
