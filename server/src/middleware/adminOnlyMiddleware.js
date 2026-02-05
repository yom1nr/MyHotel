function adminOnlyMiddleware(req, res, next) {
  const role = req.user?.role
  if (role !== 'admin' && role !== 'manager') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden',
    })
  }

  return next()
}

module.exports = adminOnlyMiddleware
