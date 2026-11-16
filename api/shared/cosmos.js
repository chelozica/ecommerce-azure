const { CosmosClient } = require("@azure/cosmos");

// Reaproveita o mesmo cliente entre execuções da Function (evita abrir conexão a cada request).
let container;

function getOrdersContainer() {
    if (!container) {
        const connectionString = process.env.COSMOS_CONNECTION_STRING;
        if (!connectionString) {
            throw new Error("COSMOS_CONNECTION_STRING não configurada");
        }
        const client = new CosmosClient(connectionString);
        container = client
            .database(process.env.COSMOS_DATABASE || "lojinha")
            .container(process.env.COSMOS_CONTAINER || "orders");
    }
    return container;
}

module.exports = { getOrdersContainer };
