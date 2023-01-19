const {Router} = require("express");

const fs = require("fs");

function createRouter({Response}) {
    const router = Router();

    router.get("/messages", function (req, res) {
        fs.readFile("./apps/chat/db/messages.json", "utf-8", function (err, data) {
            if (err) {
                new Response(String(err), 500).write(res);
                res.end();
            } else {
                new Response(JSON.parse(data)).write(res);
                res.end();
            }
        })
    })

    router.get("/messages/:user", function (req, res) {
        fs.readFile("./apps/chat/db/messages.json", "utf-8", function (err, data) {
            if (err) {
                new Response(String(err), 500).write(res);
                res.end();
            } else {
                let msgs = JSON.parse(data);
                let sorted = [];
                for (let msg of msgs) {
                    if (msg.user === req.params.user) sorted.push(msg);
                }
                new Response(sorted).write(res);
                res.end();
            }
        })
    })
    
    router.post("/send", function (req, res) {
        if (req.body == null || req.body == undefined) {
            new Response(String(new Error("No body present")), 500).write(res);
            res.end();
        } else if (req.user === null) {
            new Response(String(new Error("User not authenticated")), 403).write(res);
            res.end();
        } else {
            fs.readFile("./apps/chat/db/messages.json", "utf-8", function (err, data) {
                if (err) {
                    new Response(String(err), 500).write(res);
                    res.end();
                } else {
                    let messages = [...JSON.parse(data), {
                        user: req.user.uuid,
                        content: req.body.message,
                        timestamp: new Date().getTime()
                    }];
                    fs.writeFile("./apps/chat/db/messages.json", JSON.stringify(messages), "utf-8", function (err) {
                        if (err) {
                            new Response(String(err), 500).write(res);
                            res.end();
                        } else {
                            new Response(messages).write(res);
                            res.end();
                        }
                    })
                }
            })
        }
    })

    return router;
}


module.exports = createRouter;