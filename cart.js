function clearCart() {
    localStorage.removeItem("cart");
    location.reload();
}

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId) {
    let cart = getCart();

    const item = cart.find(p => p.id === productId);

    if (item) {
        item.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    saveCart(cart);

    alert("Produto adicionado ao carrinho ✅");
}
