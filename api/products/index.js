module.exports = async function (context, req) {
    const products = [
        { id: 1, name: "Blusinha", price: 100 },
        { id: 2, name: "Calça", price: 200 },
        { id: 3, name: "Vestidinho", price: 300 }
    ];

    context.res = {
        status: 200,
        body: products
    };
};
``
