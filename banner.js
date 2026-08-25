const bannerInput = document.getElementById("bannerInput");
const bannerPreview = document.getElementById("bannerPreview");
const saveBannerBtn = document.getElementById("saveBannerBtn");
const bannerStatus = document.getElementById("bannerStatus");

let selectedBannerFile = null;

// अभी सेव किया हुआ banner दिखाएं
async function loadCurrentBanner() {
  const { data, error } = await supabaseClient
    .from("site_settings")
    .select("banner_url")
    .eq("id", 1)
    .single();

  if (!error && data && data.banner_url) {
    bannerPreview.src = data.banner_url;
    bannerPreview.style.display = "block";
  }
}

bannerInput.addEventListener("change", () => {
  const file = bannerInput.files[0];
  if (!file) return;
  selectedBannerFile = file;
  bannerPreview.src = URL.createObjectURL(file);
  bannerPreview.style.display = "block";
});

saveBannerBtn.addEventListener("click", async () => {
  if (!selectedBannerFile) {
    alert("पहले कोई image चुनें");
    return;
  }
  saveBannerBtn.disabled = true;
  bannerStatus.textContent = "⏳ Banner अपलोड हो रहा है...";

  try {
    const path = `banner_${Date.now()}_${selectedBannerFile.name}`;
    const { error: uploadErr } = await supabaseClient.storage
      .from("catalog-media")
      .upload(path, selectedBannerFile);
    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabaseClient.storage
      .from("catalog-media")
      .getPublicUrl(path);

    const { error: updateErr } = await supabaseClient
      .from("site_settings")
      .update({ banner_url: urlData.publicUrl })
      .eq("id", 1);
    if (updateErr) throw updateErr;

    bannerStatus.textContent = "✅ Banner सेव हो गया";
    selectedBannerFile = null;
  } catch (err) {
    console.error(err);
    bannerStatus.textContent = "❌ समस्या: " + err.message;
  } finally {
    saveBannerBtn.disabled = false;
  }
});

loadCurrentBanner();
