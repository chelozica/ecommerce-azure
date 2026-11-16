const { getOrdersContainer } = require("../shared/cosmos");

module.exports = async function (context, req) {
    try {
        const { resources: orders } = await getOrdersContainer()
            .items.query("SELECT c.id, c.createdAt, c.status, c.items, c.total FROM c ORDER BY c.createdAt DESC")
            .fetchAll();

        context.res = { status: 200, body: orders };
    } catch (err) {
        context.log.error("Erro ao listar pedidos:", err.message);
        context.res = { status: 500, body: { message: "Erro ao listar pedidos" } };
    }
};
