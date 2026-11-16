// Máquina de estados do pedido: define quais status existem e para onde cada um pode ir.
// Fica só aqui, no servidor, para que todas as Functions sigam a mesma regra.
const STATUS_LABELS = {
    novo: "Novo",
    pago: "Pago",
    em_separacao: "Em separação",
    enviado: "Enviado",
    entregue: "Entregue",
    cancelado: "Cancelado"
};

const TRANSITIONS = {
    novo: ["pago", "cancelado"],
    pago: ["em_separacao", "cancelado"],
    em_separacao: ["enviado", "cancelado"],
    enviado: ["entregue"],
    entregue: [],
    cancelado: []
};

function isValidStatus(status) {
    return Object.prototype.hasOwnProperty.call(STATUS_LABELS, status);
}

function nextStatuses(current) {
    return TRANSITIONS[current] || [];
}

function canTransition(from, to) {
    return nextStatuses(from).includes(to);
}

module.exports = { STATUS_LABELS, isValidStatus, nextStatuses, canTransition };
