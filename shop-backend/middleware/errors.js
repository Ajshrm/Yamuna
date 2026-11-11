class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must contain valid JSON' })
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' })
  }
  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ error: 'This product is used by an existing order' })
  }

  if (error.status) {
    return res.status(error.status).json({ error: error.message })
  }

  console.error(error)
  return res.status(500).json({ error: 'Internal server error' })
}

module.exports = { HttpError, asyncHandler, errorHandler }
