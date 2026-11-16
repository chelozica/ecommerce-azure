const products = require("../shared/products");

module.exports = async function (context, req) {
    context.res = {
        status: 200,
        body: products
    };
};
