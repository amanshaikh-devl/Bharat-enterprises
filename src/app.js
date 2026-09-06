const PRODUCT_KEY = "be_products";

const defaultProducts = [
  {
    id: "BE001",
    name: "White Marble Tile",
    category: "Tiles",
    price: 45,
    unit: "sq.ft",
    size: "4 x 2 ft",
    finish: "Glossy",
    color: "White",
    material: "Ceramic",
    code: "BE001",
    description: "Premium white marble finish tile.",
    image: "",
    visible: true,
    featured: true,
    newArrival: false
  },
  {
    id: "BE002",
    name: "Granite Slab",
    category: "Granite",
    price: 120,
    unit: "sq.ft",
    size: "8 x 4 ft",
    finish: "Polished",
    color: "Black",
    material: "Granite",
    code: "BE002",
    description: "Premium polished granite slab.",
    image: "",
    visible: true,
    featured: false,
    newArrival: true
  },
  {
    id: "BE003",
    name: "Wooden Flooring",
    category: "Flooring",
    price: 85,
    unit: "sq.ft",
    size: "6 x 4 ft",
    finish: "Matt",
    color: "Brown",
    material: "Ceramic",
    code: "BE003",
    description: "Elegant wooden look flooring.",
    image: "",
    visible: true,
    featured: true,
    newArrival: true
  }
];

let remoteProducts = null;

async function loadProductsFromGitHub() {
  try {
    const response = await fetch("data/products.json?ts=" + Date.now());

    if (!response.ok) {
      throw new Error("products.json load failed");
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      remoteProducts = data;
      renderProducts();
    }
  } catch (error) {
    console.error("GitHub product data error:", error);
  }
}

function getProducts() {
  if (Array.isArray(remoteProducts)) {
    return remoteProducts;
  }

  try {
    const saved = localStorage.getItem(PRODUCT_KEY);

    if (!saved) {
      return defaultProducts;
    }

    const data = JSON.parse(saved);

    return Array.isArray(data) ? data : defaultProducts;
  } catch (error) {
    console.error("Product data error:", error);
    return defaultProducts;
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

function renderFeaturedProducts() {
  const grid = document.getElementById("publicProductGrid");

  if (!grid) {
    console.log("Product grid not found.");
    return;
  }

  const products = getProducts();

  const featured = products.filter(function (product) {
    return product.visible !== false && product.featured === true;
  });

  if (featured.length === 0) {
    grid.innerHTML = `
      <p style="grid-column:1/-1;text-align:center;">
        No featured products available.
      </p>
    `;
    return;
  }

  grid.innerHTML = featured.map(function (product) {

    const imageHTML = product.image
      ? `<img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">`
      : escapeHTML(product.name);

    const badgeHTML = product.newArrival
      ? `<span class="badge">New</span>`
      : "";

    return `
      <article class="product-card">

        <div class="product-image placeholder">
          ${imageHTML}
          ${badgeHTML}
        </div>

        <div class="product-info">

          <h3>${escapeHTML(product.name)}</h3>

          <p class="product-price">
            ₹${escapeHTML(product.price)}
            <span>/ ${escapeHTML(product.unit)}</span>
          </p>

          <button type="button" class="product-btn" onclick="showProductDetails('${escapeHTML(product.id)}'); return false;">
            View Details
          </button>

        </div>

      </article>
    `;
  }).join("");
}


function showProductDetails(productId) {
  const product = getProducts().find(function (p) {
    return String(p.id) === String(productId);
  });

  if (!product) return;

  let modal = document.getElementById("productDetailsModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "productDetailsModal";

    modal.style.cssText = `
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.65);
      z-index:9999;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      box-sizing:border-box;
    `;

    document.body.appendChild(modal);
  }

  const image = product.image
    ? `<img src="${escapeHTML(product.image)}"
         alt="${escapeHTML(product.name)}"
         style="width:100%;height:220px;object-fit:cover;border-radius:8px;display:block;">`
    : `<div style="height:220px;background:#f1f1f1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#555;">
         ${escapeHTML(product.name)}
       </div>`;

  modal.innerHTML = `
    <div style="
      width:min(520px,100%);
      max-height:90vh;
      overflow:auto;
      background:#fff;
      border-radius:12px;
      padding:20px;
      box-sizing:border-box;
      position:relative;
    ">

      <button onclick="closeProductDetails()" style="
        position:absolute;
        right:12px;
        top:12px;
        width:36px;
        height:36px;
        border:0;
        border-radius:50%;
        background:#111;
        color:#fff;
        font-size:22px;
        cursor:pointer;
      ">×</button>

      ${image}

      <h2 style="margin:18px 0 8px;color:#172033;">
        ${escapeHTML(product.name)}
      </h2>

      <div style="font-size:20px;font-weight:700;color:#168c42;margin-bottom:15px;">
        ₹${escapeHTML(product.price)}
        <span style="font-size:14px;color:#777;font-weight:500;">
          / ${escapeHTML(product.unit)}
        </span>
      </div>

      <p style="color:#555;line-height:1.6;margin-bottom:18px;">
        ${escapeHTML(product.description || "Premium quality product from Bharat Enterprises.")}
      </p>

      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
        margin-bottom:20px;
      ">

        <div><strong>Category</strong><br>${escapeHTML(product.category)}</div>
        <div><strong>Size</strong><br>${escapeHTML(product.size || "-")}</div>
        <div><strong>Finish</strong><br>${escapeHTML(product.finish || "-")}</div>
        <div><strong>Color</strong><br>${escapeHTML(product.color || "-")}</div>
        <div><strong>Material</strong><br>${escapeHTML(product.material || "-")}</div>
        <div><strong>Product Code</strong><br>${escapeHTML(product.code || "-")}</div>

      </div>

      <button onclick="closeProductDetails()" style="
        width:100%;
        padding:12px;
        border:1px solid #168c42;
        background:#168c42;
        color:#fff;
        border-radius:6px;
        font-size:15px;
        cursor:pointer;
      ">
        Close
      </button>

    </div>
  `;

  modal.style.display = "flex";
}

function closeProductDetails() {
  const modal = document.getElementById("productDetailsModal");

  if (modal) {
    modal.style.display = "none";
  }
}


function renderAllProducts() {
  const grid = document.getElementById("publicProductGrid");

  if (!grid) return;

  const products = getProducts().filter(function (product) {
    return product.visible !== false;
  });

  if (products.length === 0) {
    grid.innerHTML = `
      <p style="grid-column:1/-1;text-align:center;">
        No products available.
      </p>
    `;
    return;
  }

  grid.innerHTML = products.map(function (product) {

    const imageHTML = product.image
      ? `<img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">`
      : escapeHTML(product.name);

    const badgeHTML = product.newArrival
      ? `<span class="badge">New</span>`
      : product.featured
        ? `<span class="badge">Featured</span>`
        : "";

    return `
      <article class="product-card">

        <div class="product-image placeholder">
          ${imageHTML}
          ${badgeHTML}
        </div>

        <div class="product-info">

          <h3>${escapeHTML(product.name)}</h3>

          <p class="product-price">
            ₹${escapeHTML(product.price)}
            <span>/ ${escapeHTML(product.unit)}</span>
          </p>

          <button type="button"
            class="product-btn"
            onclick="showProductDetails('${escapeHTML(product.id)}'); return false;">
            View Details
          </button>

        </div>

      </article>
    `;
  }).join("");
}

function showAllProducts() {
  const grid = document.getElementById("publicProductGrid");

  if (!grid) return;

  const heading = document.querySelector("#products h2");

  if (heading) {
    heading.textContent = "All Products";
  }

  renderAllProducts();

  document.getElementById("products").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("Bharat Enterprises website loaded successfully.");
  console.log("Bharat Enterprises - Tiles & Marbles");

  renderFeaturedProducts();
  loadProductsFromGitHub();
});
