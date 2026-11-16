const { randomUUID } = require("crypto");
const products = require("../shared/products");
const { getOrdersContainer } = require("../shared/cosmos");

module.exports = async function (context, req) {
    const cart = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
        context.res = { status: 400, body: { message: "Carrinho vazio ou inválido" } };
        return;
    }

    // Monta os itens com nome e preço do catálogo do servidor (não confiamos no preço vindo do navegador).
    const items = [];
    for (const entry of cart) {
        const product = products.find(p => p.id === Number(entry.id));
        const quantity = Number(entry.quantity);

        if (!product || !Number.isInteger(quantity) || quantity < 1) {
            context.res = { status: 400, body: { message: "Item inválido no carrinho" } };
            return;
        }

        items.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            subtotal: product.price * quantity
        });
    }

    const now = new Date().toISOString();
    const order = {
        id: randomUUID(),
        createdAt: now,
        status: "novo",
        history: [{ from: null, to: "novo", at: now, by: "cliente" }],
        items,
        total: items.reduce((sum, i) => sum + i.subtotal, 0)
    };

    try {
        await getOrdersContainer().items.create(order);
    } catch (err) {
        context.log.error("Erro ao gravar pedido:", err.message);
        context.res = { status: 500, body: { message: "Não foi possível gravar o pedido" } };
        return;
    }

    context.res = {
        status: 201,
        body: {
            message: "Pedido criado com sucesso ✅",
            orderId: order.id,
            total: order.total
        }
    };
};
