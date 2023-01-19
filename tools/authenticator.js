const {Router} = require("express");
const router = Router();

const crypto = require("crypto");
const fs = require("fs");
const {v4: uuidV4} = require("uuid");

const Response = require("./response")


if (!fs.existsSync("./auth")) fs.mkdirSync("./auth");
if (!fs.existsSync("./auth/users.json")) fs.writeFileSync("./auth/users.json", JSON.stringify([]), "utf-8");
if (!fs.existsSync("./auth/tokens.json")) fs.writeFileSync("./auth/tokens.json", JSON.stringify([]), "utf-8");


function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

function verifyPassword(password, auth) {
    return crypto.pbkdf2Sync(password, auth.salt, 1000, 64, "sha512").toString("hex") === auth.hash;
}

router.use("*", function (req, res, next) {
    fs.readFile("./auth/users.json", "utf-8", function (err, raw_users) {
        if (err) {
            req.user = null;
            next();
        } else {
            fs.readFile("./auth/tokens.json", "utf-8", function (err, raw_tokens) {
                if (err) {
                    req.user = null;
                    next();
                } else {
                    let users = JSON.parse(raw_users);
                    let tokens = JSON.parse(raw_tokens);

                    req.user = null;

                    for (let token of tokens) {
                        if (token.token === req.query.token && (new Date()).getTime() < token.expires) {
                            for (let user of users) {
                                if (user.uuid === token.uuid) {
                                    req.user = {
                                        username: user.username,
                                        token: token.token,
                                        uuid: user.uuid
                                    }
                                }
                            }
                        }
                    }

                    next();
                }
            });
        }
    });
})

router.post("/authenticate", function (req, res) {
    fs.readFile("./auth/users.json", "utf-8", function (err, raw_users) {
        if (err) {
            new Response(String(err), 500).write(res);
            res.end();
        } else {
            let users = JSON.parse(raw_users);
            
            for (let user of users) {
                if (user.username === req.body.username && verifyPassword(req.body.password, user.auth)) {
                    let auth_token = crypto.randomBytes(32).toString("hex");
                    let date = new Date();
                    date.setDate(date.getDate() + 14);

                    let key = {
                        token: auth_token,
                        expires: date.getTime(),
                        uuid: user.uuid
                    };

                    fs.readFile("./auth/tokens.json", "utf-8", function (err, raw_tokens) {
                        if (err) {
                            new Response(String(err), 500).write(res);
                        res.end();
                        } else {
                            let tokens = JSON.parse(raw_tokens);
                            tokens.push(key);
                            fs.writeFile("./auth/tokens.json", JSON.stringify(tokens), function (err) {
                                if (err) {
                                    new Response(String(err), 500).write(res);
                                    res.end();
                                } else {
                                    new Response(key).write(res);
                                    res.end();
                                    
                                }
                            })
                        }
                    })

                    return;
                }
            }

            new Response(String(new Error("Invalid username or password.")), 500).write(res);
            res.end();
        }
    })
})

router.post("/register", function (req, res) {
    fs.readFile("./auth/users.json", "utf-8", function (err, raw_users) {
        if (err) {
            new Response(String(err), 500).write(res);
            res.end();
        } else {
            let users = JSON.parse(raw_users);
            for (let user of users) {
                if (user.username === req.body.username) {
                    new Response(String(new Error("Account already exists with that username")), 500).write(res);
                    res.end();
                    return;
                }
            }
            let salt = crypto.randomBytes(16).toString("hex");
            let hash = hashPassword(req.body.password, salt);
            users.push({
                username: req.body.username,
                uuid: uuidV4(),
                auth: { salt, hash }
            })
            fs.writeFile("./auth/users.json", JSON.stringify(users), function (err) {
                if (err) {
                    new Response(String(err), 500).write(res);
                    res.end();
                } else {
                    new Response({
                        username: users[users.length-1].username,
                        uuid: users[users.length-1].uuid
                    }).write(res);
                    res.end();
                }
            })
        }
    })
})



module.exports = router;