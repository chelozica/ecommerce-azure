// Utilidades compartilhadas por todas as páginas.
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const ARCH_ICON = `
    <svg viewBox="0 0 36 40" aria-hidden="true">
        <path d="M6 38V17a12 12 0 0 1 24 0v21" fill="none" stroke="#1A1A1A" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M2 38h32" stroke="#1A1A1A" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`;

function formatPrice(value) {
    return currency.format(value);
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
}

function productMedia(product) {
    const tone = ((product.id - 1) % 3) + 1;
    return `<div class="product-media tone-${tone}">${ARCH_ICON}</div>`;
}

function renderProductCard(product) {
    return `
        <article class="product-card">
            ${productMedia(product)}
            <div class="product-info">
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <span class="product-price">${formatPrice(product.price)}</span>
            </div>
            <button class="btn btn-ghost btn-small" onclick="addToCart(${Number(product.id)})">Adicionar à sacola</button>
        </article>`;
}

async function fetchProducts() {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

function updateCartBadge() {
    const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach(el => {
        el.textContent = count;
        el.hidden = count === 0;
    });
}

let toastTimer;
function showToast(message, type) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        toast.setAttribute("role", "status");
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.toggle("error", type === "error");
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

// /.auth/me é uma rota do Static Web App que informa quem está logado e seus papéis.
// Esconder o link é só visual: a proteção real está no staticwebapp.config.json.
async function renderAuthArea() {
    const area = document.getElementById("auth-area");
    if (!area) return;
    try {
        const response = await fetch("/.auth/me");
        const { clientPrincipal } = await response.json();
        if (!clientPrincipal) return;

        const logout = `<a href="/.auth/logout?post_logout_redirect_uri=/index.html">Sair</a>`;
        area.innerHTML = clientPrincipal.userRoles.includes("admin")
            ? `<a href="admin.html">Área admin</a> &nbsp;·&nbsp; ${logout}`
            : logout;
    } catch (err) {
        console.error("Não foi possível verificar o login", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
    renderAuthArea();
});
