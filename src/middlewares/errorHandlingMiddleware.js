const { model } = require("mongoose");

const errorHandlingMiddleware = (err, req, res, next) => {
    const statusCode =  res.statusCode ? res.statusCode : 500;

    res.status(statusCode).json({
        message: err.message,
        statusCode,
        stack: err.stack,
    })
};

module.exports = errorHandlingMiddleware;