const { getOrdersContainer } = require("../shared/cosmos");
const { getUser, isAdmin } = require("../shared/auth");
const { STATUS_LABELS, isValidStatus, canTransition, nextStatuses } = require("../shared/orderStatus");

function reply(context, status, body) {
    context.res = { status, body };
}

module.exports = async function (context, req) {
    if (!isAdmin(req)) {
        return reply(context, 403, { message: "Acesso negado" });
    }

    const id = context.bindingData.id;
    const body = req.body || {};
    const newStatus = body.status;
    const trackingCode = typeof body.trackingCode === "string" ? body.trackingCode.trim() : "";

    if (!isValidStatus(newStatus)) {
        return reply(context, 400, { message: "Status inválido" });
    }
    if (newStatus === "enviado" && !trackingCode) {
        return reply(context, 400, { message: "Informe o código de rastreio para marcar como enviado" });
    }

    // Partition key é /id, então o id serve para localizar o documento e a partição.
    const item = getOrdersContainer().item(id, id);

    try {
        const { resource: order, etag } = await item.read();
        if (!order) {
            return reply(context, 404, { message: "Pedido não encontrado" });
        }

        if (!canTransition(order.status, newStatus)) {
            return reply(context, 409, {
                message: `Não é possível mudar de "${STATUS_LABELS[order.status] || order.status}" para "${STATUS_LABELS[newStatus]}"`
            });
        }

        const now = new Date().toISOString();
        order.history = order.history || [];
        order.history.push({ from: order.status, to: newStatus, at: now, by: getUser(req).userDetails });
        order.status = newStatus;
        order.updatedAt = now;
        if (trackingCode) order.trackingCode = trackingCode;

        // IfMatch + ETag = concorrência otimista: só grava se ninguém alterou o pedido desde a leitura.
        await item.replace(order, { accessCondition: { type: "IfMatch", condition: etag } });

        return reply(context, 200, {
            message: `Pedido atualizado para "${STATUS_LABELS[newStatus]}"`,
            status: newStatus,
            nextStatuses: nextStatuses(newStatus)
        });
    } catch (err) {
        if (err.code === 404) {
            return reply(context, 404, { message: "Pedido não encontrado" });
        }
        if (err.code === 412) {
            return reply(context, 409, { message: "O pedido foi alterado por outra pessoa. Atualize a lista e tente de novo." });
        }
        context.log.error("Erro ao atualizar pedido:", err.message);
        return reply(context, 500, { message: "Erro ao atualizar pedido" });
    }
};
