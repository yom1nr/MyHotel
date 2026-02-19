const { v4: uuidv4 } = require('uuid')

function requestId(req, _res, next) {
    req.requestId = req.headers['x-request-id'] || uuidv4()
    next()
}

module.exports = requestId
