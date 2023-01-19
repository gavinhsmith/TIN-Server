const fs = require("fs");

function getAllApps() {
    return fs.readdirSync("./apps");
}

function getAppInfo(id) {
    return JSON.parse(fs.readFileSync("./apps/" + id + "/info.json", "utf-8"));
}

function initApp(id) {
    require("./apps/" + id + "/init.js")("./apps/" + id);
}

exports.getAllApps = getAllApps;
exports.getAppInfo = getAppInfo;
exports.initApp = initApp;