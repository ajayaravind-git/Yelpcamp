class ExpressError extends Error {         //Express error  class
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}
module.exports = ExpressError;