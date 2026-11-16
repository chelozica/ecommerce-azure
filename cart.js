// Sacola guardada no navegador (localStorage): só ids e quantidades.
// Nome e preço sempre vêm da API, que é a fonte oficial.
const CART_KEY = "cart";

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (err) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    if (typeof updateCartBadge === "function") updateCartBadge();
}

function clearCart() {
    saveCart([]);
}

function addToCart(productId) {
    const cart = getCart();
    const item = cart.find(p => p.id === productId);

    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    saveCart(cart);
    if (typeof showToast === "function") showToast("Adicionado à sacola");
}

function setQuantity(productId, quantity) {
    let cart = getCart();
    if (quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    } else {
        const item = cart.find(i => i.id === productId);
        if (item) item.quantity = quantity;
    }
    saveCart(cart);
}
