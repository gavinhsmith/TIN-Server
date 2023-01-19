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
    
    router.post("/send", function (req, res) {
        if (req.body == null || req.body == undefined) {
            new Response(String(new Error("No body present")), 500).write(res);
            res.end();
        } else {
            fs.readFile("./apps/chat/db/messages.json", "utf-8", function (err, data) {
                if (err) {
                    new Response(String(err), 500).write(res);
                    res.end();
                } else {
                    fs.writeFile("./apps/chat/db/messages.json", JSON.stringify([...JSON.parse(data), req.body.message]), "utf-8", function (err) {
                        if (err) {
                            new Response(String(err), 500).write(res);
                            res.end();
                        } else {
                            new Response([...JSON.parse(data), req.body.message]).write(res);
                            res.end();
                        }
                    })
                }
            })
        };
    })

    return router;
}


module.exports = createRouter;