const bcrypt = require('bcrypt')
const express = require('express')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')
const { authenticateToken } = require('../middleware/auth')
const { asyncHandler, HttpError } = require('../middleware/errors')

const router = express.Router()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  )
}

router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const [users] = await pool.execute(
    'SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1',
    [req.user.id],
  )
  if (!users[0]) {
    throw new HttpError(401, 'Account no longer exists')
  }
  return res.json({ user: users[0] })
}))

router.post('/register', asyncHandler(async (req, res) => {
  const body = req.body || {}
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!name || name.length > 100) {
    throw new HttpError(400, 'Name is required and must be 100 characters or fewer')
  }
  if (!emailPattern.test(email) || email.length > 254) {
    throw new HttpError(400, 'A valid email is required')
  }
  if (password.length < 8 || password.length > 72) {
    throw new HttpError(400, 'Password must be between 8 and 72 characters')
  }

  const passwordHash = await bcrypt.hash(password, 12)
  let result

  try {
    ;[result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash],
    )
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'An account with this email already exists')
    }
    throw error
  }

  const user = { id: result.insertId, name, email, role: 'customer' }
  return res.status(201).json({ token: createToken(user), user })
}))

router.post('/login', asyncHandler(async (req, res) => {
  const body = req.body || {}
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const [users] = await pool.execute(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
    [email],
  )
  const user = users[0]

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, 'Invalid email or password')
  }

  const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role }
  return res.json({ token: createToken(publicUser), user: publicUser })
}))

module.exports = router
