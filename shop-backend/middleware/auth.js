const jwt = require('jsonwebtoken')
const pool = require('../config/db')

function authenticateToken(req, res, next) {
  const authorization = req.get('authorization')
  const [scheme, token] = authorization ? authorization.split(' ') : []

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

async function requireRole(roles, message, req, res, next) {
  try {
    const [users] = await pool.execute('SELECT role FROM users WHERE id = ? LIMIT 1', [req.user.id])
    if (!users[0]) {
      return res.status(401).json({ error: 'Account no longer exists' })
    }
    if (!roles.includes(users[0].role)) {
      return res.status(403).json({ error: message })
    }
    req.user.role = users[0].role
    return next()
  } catch (error) {
    return next(error)
  }
}

function requireSeller(req, res, next) {
  return requireRole(['seller', 'admin'], 'Seller access required', req, res, next)
}

function requireCustomer(req, res, next) {
  return requireRole(['customer', 'seller', 'admin'], 'Customer access required', req, res, next)
}

module.exports = { authenticateToken, requireSeller, requireCustomer }
