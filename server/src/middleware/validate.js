const { ZodError } = require('zod')
const { ValidationError } = require('../utils/AppError')

function validate(schema) {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body)
            next()
        } catch (err) {
            if (err instanceof ZodError) {
                const details = err.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }))
                return next(new ValidationError('Validation failed', details))
            }
            next(err)
        }
    }
}

module.exports = validate
