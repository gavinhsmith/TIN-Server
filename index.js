const config = require("./config.json");
const nodepackage = require("./package.json");

const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");

const express_app = express();
const server = http.createServer(express_app);

const {getAllApps, getAppInfo, initApp} = require("./appLoader");

// Early Middleware
express_app.use(bodyParser.urlencoded({ extended: true }));
express_app.use(bodyParser.json());

express_app.use(require("./tools/authenticator"));

express_app.use(function (req, res, next) {
    console.debug(`Request to ${req.path} (Authenticated: ${req.user === null ? "NO" : "YES [" + req.user.username + "]"})`)
    next();
})

// Load Apps
let app_names = getAllApps();

let apps = {};

for (let app of app_names) {
    let info = getAppInfo(app);
    console.info(`Loading ${info.name} v${info.version}... (Endpoint: /${app})`);
    express_app.use(`/${app}`, require(`./apps/${app}/router`)({
        Response: require("./tools/response")
    }));
    initApp(app);
    apps[app] = info;
}

// Root Functionallity
express_app.get("/", function (req, res) {
    res.status(200);
    res.type("application/json")
    res.send({
        name: config.name,
        description: config.description,
        version: nodepackage.version,
        apps
    })
    res.end();
})

server.listen(config.port, function () {
    console.info("Server Started on *:" + config.port)
});