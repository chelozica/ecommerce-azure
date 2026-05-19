module.exports = async function (context, req) {
    const order = req.body;

    console.log("Pedido recebido:", order);

    context.res = {
        status: 200,
        body: {
            message: "Pedido criado com sucesso ✅",
            order: order
        }
    };
};
``
