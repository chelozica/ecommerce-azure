// O Static Web App injeta o usuário logado no header "x-ms-client-principal" (JSON em base64).
// Ler aqui é uma segunda camada de proteção, além das rotas do staticwebapp.config.json.
function getUser(req) {
    const header = req.headers["x-ms-client-principal"];
    if (!header) return null;
    try {
        return JSON.parse(Buffer.from(header, "base64").toString("utf8"));
    } catch (err) {
        return null;
    }
}

function isAdmin(req) {
    const user = getUser(req);
    return Boolean(user && Array.isArray(user.userRoles) && user.userRoles.includes("admin"));
}

module.exports = { getUser, isAdmin };
