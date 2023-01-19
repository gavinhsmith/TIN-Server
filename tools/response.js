class Response {
    constructor(data, status = 200) {
        this.status = status;
        this.data = data;
    }

    write(res) {
        res.status(this.status);
        res.type("application/json")
        res.send({
            status: this.status,
            content: this.data
        })
    }
}

module.exports = Response;