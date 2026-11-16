const { getOrdersContainer } = require("../shared/cosmos");
const { isAdmin } = require("../shared/auth");
const { STATUS_LABELS, isValidStatus, nextStatuses } = require("../shared/orderStatus");

module.exports = async function (context, req) {
    if (!isAdmin(req)) {
        context.res = { status: 403, body: { message: "Acesso negado" } };
        return;
    }

    const statusFilter = req.query.status;
    if (statusFilter && !isValidStatus(statusFilter)) {
        context.res = { status: 400, body: { message: "Status inválido" } };
        return;
    }

    // Query parametrizada (@status): o valor nunca é concatenado no SQL, evitando injeção.
    const querySpec = {
        query: `SELECT c.id, c.createdAt, c.updatedAt, c.status, c.items, c.total, c.trackingCode, c.history
                FROM c ${statusFilter ? "WHERE c.status = @status" : ""}
                ORDER BY c.createdAt DESC`,
        parameters: statusFilter ? [{ name: "@status", value: statusFilter }] : []
    };

    try {
        const { resources } = await getOrdersContainer().items.query(querySpec).fetchAll();

        const orders = resources.map(o => ({
            ...o,
            statusLabel: STATUS_LABELS[o.status] || o.status,
            nextStatuses: nextStatuses(o.status).map(s => ({ value: s, label: STATUS_LABELS[s] }))
        }));

        context.res = { status: 200, body: { statuses: STATUS_LABELS, orders } };
    } catch (err) {
        context.log.error("Erro ao listar pedidos:", err.message);
        context.res = { status: 500, body: { message: "Erro ao listar pedidos" } };
    }
};
