const fs = require("fs");
const path = require("path");

function init(root) {
    if (!fs.existsSync(path.join(root, "./db"))) fs.mkdirSync(path.join(root, "./db"));
    if (!fs.existsSync(path.join(root, "./db/messages.json"))) fs.writeFileSync(path.join(root, "./db/messages.json"), JSON.stringify([]), "utf-8");
}

module.exports = init;