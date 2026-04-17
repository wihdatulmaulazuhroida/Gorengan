const BUSINESS = {
  name: "Gorengan Bu Fitriyani",
  location: "Latek, Bangil, Pasuruan",
  waNumber: "6287710873166",
  waDisplay: "+62 877-1087-3166",
};

const PRODUCTS = [
  {
    id: "tahu-isi",
    name: "Tahu Isi",
    price: 2000,
    priceLabel: "Rp 2000",
    description: "Gurih, renyah, dan fresh dari dapur.",
    image: "./assets/tahu-isi.svg",
  },
  {
    id: "tempe-goreng",
    name: "Tempe Goreng",
    price: 2000,
    priceLabel: "Rp 2000",
    description: "Gurih, renyah, dan fresh dari dapur.",
    image: "./assets/tempe-goreng.svg",
  },
];

const FUTURE_PLACEHOLDERS = [
  { name: "[Nama Menu]", priceLabel: "Rp [Harga]" },
  { name: "[Nama Menu]", priceLabel: "Rp [Harga]" },
  { name: "[Nama Menu]", priceLabel: "Rp [Harga]" },
];

/** @type {Map<string, number>} */
const cart = new Map();

function rupiah(n) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `Rp ${n}`;
  }
}

function totalItems() {
  let total = 0;
  for (const qty of cart.values()) total += qty;
  return total;
}

function setQty(productId, nextQty) {
  const qty = Math.max(0, Math.floor(Number(nextQty) || 0));
  if (qty <= 0) cart.delete(productId);
  else cart.set(productId, qty);
  renderCartBadges();
  syncMenuPickerWithCart();
}

function addOne(productId) {
  const current = cart.get(productId) || 0;
  setQty(productId, current + 1);
}

function waLinkForMessage(message) {
  const base = `https://wa.me/${BUSINESS.waNumber}`;
  const text = encodeURIComponent(message);
  return `${base}?text=${text}`;
}

function buildOrderMessage(formData, picked) {
  const lines = [];
  lines.push("Halo, saya mau pesan gorengan berikut:");
  lines.push("");
  lines.push(`Nama: ${formData.nama}`);
  lines.push(`WA: ${formData.waPembeli}`);
  lines.push(`Alamat: ${formData.alamat}`);
  lines.push("");
  lines.push("Pesanan:");

  let subtotal = 0;
  for (const item of picked) {
    const rowTotal = item.price * item.qty;
    subtotal += rowTotal;
    lines.push(`- ${item.name} x${item.qty} (${rupiah(rowTotal)})`);
  }
  lines.push("");
  lines.push(`Total item: ${picked.reduce((a, b) => a + b.qty, 0)}`);
  lines.push(`Perkiraan total: ${rupiah(subtotal)}`);

  if (formData.catatan) {
    lines.push("");
    lines.push(`Catatan: ${formData.catatan}`);
  }

  lines.push("");
  lines.push(`(Dikirim dari website ${BUSINESS.name})`);
  return lines.join("\n");
}

function qs(sel) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el;
}

function renderProducts() {
  const grid = qs("#productGrid");
  grid.innerHTML = "";

  for (const p of PRODUCTS) {
    const card = document.createElement("article");
    card.className = "card reveal";
    card.dataset.productId = p.id;

    card.innerHTML = `
      <div class="card__imgWrap" role="button" tabindex="0" aria-label="Lihat detail ${escapeHtml(p.name)}">
        <img class="card__img floaty" src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" />
      </div>
      <div class="card__body">
        <div class="card__top">
          <h3 class="card__name">${escapeHtml(p.name)}</h3>
          <div class="card__price">${escapeHtml(p.priceLabel)}</div>
        </div>
        <p class="card__desc">${escapeHtml(p.description)}</p>
        <div class="card__actions">
          <button class="btn btn--primary" type="button" data-add="${p.id}">Tambah ke Pesanan</button>
          <div class="qty-chip" id="chip-${p.id}" aria-live="polite">Dipilih: 0</div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  }
}

function renderFuturePlaceholders() {
  const grid = qs("#futureGrid");
  grid.innerHTML = "";
  for (const f of FUTURE_PLACEHOLDERS) {
    const card = document.createElement("article");
    card.className = "card reveal";
    card.innerHTML = `
      <div class="card__imgWrap">
        <span class="badge">Segera Hadir</span>
        <img class="card__img" src="./assets/placeholder-menu.svg" alt="Placeholder menu" loading="lazy" />
      </div>
      <div class="card__body">
        <div class="card__top">
          <h3 class="card__name">${escapeHtml(f.name)}</h3>
          <div class="card__price">${escapeHtml(f.priceLabel)}</div>
        </div>
        <p class="card__desc">Menu baru akan kami tambahkan di sini.</p>
        <div class="card__actions">
          <button class="btn btn--soft" type="button" disabled>Segera Hadir</button>
          <div class="qty-chip">—</div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCartBadges() {
  const count = totalItems();
  qs("#cartCount").textContent = `${count} item`;
  qs("#stickyCount").textContent = String(count);

  for (const p of PRODUCTS) {
    const chip = document.getElementById(`chip-${p.id}`);
    if (!chip) continue;
    const qty = cart.get(p.id) || 0;
    chip.textContent = `Dipilih: ${qty}`;
  }
}

function openModal(modalEl) {
  modalEl.classList.add("is-open");
  modalEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(modalEl) {
  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openOrderModal() {
  const modal = qs("#orderModal");
  openModal(modal);
  ensureMenuPickerRendered();
  syncMenuPickerWithCart(true);

  const firstInput = modal.querySelector("input, textarea, button");
  if (firstInput) firstInput.focus();
}

function openDetailModal(productId) {
  const p = PRODUCTS.find((x) => x.id === productId);
  if (!p) return;

  const detail = qs("#detailContent");
  detail.innerHTML = `
    <img class="detail__img" src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" />
    <div class="detail__body">
      <h4 class="detail__name">${escapeHtml(p.name)}</h4>
      <div class="detail__price">${escapeHtml(p.priceLabel)}</div>
      <div class="detail__desc">${escapeHtml(p.description)}</div>
      <div class="detail__actions">
        <button class="btn btn--primary" type="button" data-add="${p.id}">Tambah ke Pesanan</button>
        <button class="btn btn--soft" type="button" data-open-order="true">Buka Form Pesanan</button>
      </div>
    </div>
  `;

  const modal = qs("#detailModal");
  openModal(modal);
}

let pickerRendered = false;
function ensureMenuPickerRendered() {
  if (pickerRendered) return;
  const picker = qs("#menuPicker");
  picker.innerHTML = "";

  for (const p of PRODUCTS) {
    const row = document.createElement("div");
    row.className = "pick";
    row.dataset.productId = p.id;
    row.innerHTML = `
      <div class="pick__top">
        <div class="pick__left">
          <label class="pick__check">
            <input type="checkbox" name="menu" value="${p.id}" data-menu-check="${p.id}" />
            <span class="pick__name">${escapeHtml(p.name)}</span>
          </label>
        </div>
        <div class="pick__price">${escapeHtml(p.priceLabel)}</div>
      </div>
      <div class="pick__row">
        <div class="muted">Jumlah tiap item</div>
        <div class="pick__qty">
          <button class="qty-btn" type="button" data-qty-dec="${p.id}" aria-label="Kurangi ${escapeHtml(p.name)}">−</button>
          <input class="qty-input" type="number" min="0" step="1" inputmode="numeric" value="0" data-qty-input="${p.id}" />
          <button class="qty-btn" type="button" data-qty-inc="${p.id}" aria-label="Tambah ${escapeHtml(p.name)}">+</button>
        </div>
      </div>
    `;
    picker.appendChild(row);
  }
  pickerRendered = true;
}

function syncMenuPickerWithCart(force = false) {
  if (!pickerRendered) return;
  for (const p of PRODUCTS) {
    const qty = cart.get(p.id) || 0;
    const check = document.querySelector(`[data-menu-check="${p.id}"]`);
    const input = document.querySelector(`[data-qty-input="${p.id}"]`);
    if (check && (force || check.checked !== (qty > 0))) check.checked = qty > 0;
    if (input && (force || Number(input.value) !== qty)) input.value = String(qty);
  }
}

function getPickedFromPickerOrCart() {
  const picked = [];

  if (pickerRendered) {
    for (const p of PRODUCTS) {
      const check = document.querySelector(`[data-menu-check="${p.id}"]`);
      const input = document.querySelector(`[data-qty-input="${p.id}"]`);
      const checked = !!check?.checked;
      const qty = Math.max(0, Math.floor(Number(input?.value || 0)));
      if (checked && qty > 0) picked.push({ ...p, qty });
    }
  } else {
    for (const p of PRODUCTS) {
      const qty = cart.get(p.id) || 0;
      if (qty > 0) picked.push({ ...p, qty });
    }
  }

  return picked;
}

function setupEvents() {
  qs("#ctaHero").addEventListener("click", openOrderModal);
  qs("#ctaTopbar").addEventListener("click", openOrderModal);
  qs("#stickyOrder").addEventListener("click", openOrderModal);

  const waHref = `https://wa.me/${BUSINESS.waNumber}`;
  qs("#waLink").setAttribute("href", waHref);
  qs("#waFooterLink").setAttribute("href", waHref);

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;

    const addId = t.getAttribute("data-add");
    if (addId) {
      addOne(addId);
      return;
    }

    if (t.getAttribute("data-open-order") === "true") {
      closeModal(qs("#detailModal"));
      openOrderModal();
      return;
    }

    const close = t.getAttribute("data-close") === "true";
    if (close) {
      const modal = t.closest(".modal");
      if (modal) closeModal(modal);
      return;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    for (const id of ["#detailModal", "#orderModal"]) {
      const m = document.querySelector(id);
      if (m?.classList.contains("is-open")) closeModal(m);
    }
  });

  qs("#productGrid").addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest("button")) return;
    const card = t.closest(".card");
    if (!card) return;
    const pid = card.getAttribute("data-product-id");
    if (pid) openDetailModal(pid);
  });

  qs("#productGrid").addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    const wrap = t.closest(".card__imgWrap");
    if (!wrap) return;
    const card = t.closest(".card");
    const pid = card?.getAttribute("data-product-id");
    if (pid) {
      e.preventDefault();
      openDetailModal(pid);
    }
  });

  qs("#orderForm").addEventListener("submit", (e) => {
    e.preventDefault();

    /** @type {HTMLFormElement} */
    const form = e.currentTarget;
    const data = new FormData(form);
    const formData = {
      nama: String(data.get("nama") || "").trim(),
      waPembeli: String(data.get("waPembeli") || "").trim(),
      alamat: String(data.get("alamat") || "").trim(),
      catatan: String(data.get("catatan") || "").trim(),
    };

    const picked = getPickedFromPickerOrCart();
    if (picked.length === 0) {
      alert("Silakan pilih menu dan isi jumlahnya terlebih dahulu.");
      return;
    }

    // Keep cart in sync with form selection.
    for (const p of PRODUCTS) cart.delete(p.id);
    for (const item of picked) cart.set(item.id, item.qty);
    renderCartBadges();

    const msg = buildOrderMessage(formData, picked);
    window.location.href = waLinkForMessage(msg);
  });

  // Picker changes
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const id = t.getAttribute("data-menu-check");
    if (!id) return;

    const input = document.querySelector(`[data-qty-input="${id}"]`);
    const checked = /** @type {HTMLInputElement} */ (t).checked;
    const currentQty = Math.max(0, Math.floor(Number(input?.value || 0)));
    if (!checked) setQty(id, 0);
    else if (currentQty <= 0) setQty(id, 1);
  });

  document.addEventListener("input", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const id = t.getAttribute("data-qty-input");
    if (!id) return;
    const input = /** @type {HTMLInputElement} */ (t);
    const qty = Math.max(0, Math.floor(Number(input.value || 0)));
    setQty(id, qty);
  });

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;

    const inc = t.getAttribute("data-qty-inc");
    const dec = t.getAttribute("data-qty-dec");
    const id = inc || dec;
    if (!id) return;

    const current = cart.get(id) || 0;
    if (inc) setQty(id, current + 1);
    else setQty(id, Math.max(0, current - 1));
  });
}

function setupRevealAnimations() {
  const els = Array.from(document.querySelectorAll(".reveal"));
  if (els.length === 0) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const ent of entries) {
        if (!ent.isIntersecting) continue;
        ent.target.classList.add("is-visible");
        io.unobserve(ent.target);
      }
    },
    { threshold: 0.12 }
  );

  for (const el of els) io.observe(el);
}

function boot() {
  renderProducts();
  renderFuturePlaceholders();
  renderCartBadges();
  setupEvents();
  setupRevealAnimations();
}

boot();

