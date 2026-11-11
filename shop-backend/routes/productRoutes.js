const express = require('express')
const pool = require('../config/db')
const { authenticateToken, requireSeller } = require('../middleware/auth')
const { asyncHandler, HttpError } = require('../middleware/errors')

const router = express.Router()

function parseProduct(body) {
  body = body || {}
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const category = typeof body.category === 'string' ? body.category.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const image = typeof body.image === 'string' ? body.image.trim() : ''
  const price = Number(body.price)
  const stock = body.stock === undefined ? 0 : Number(body.stock)

  if (!name || name.length > 150) {
    throw new HttpError(400, 'Product name is required and must be 150 characters or fewer')
  }
  if (!category || category.length > 50) {
    throw new HttpError(400, 'Product category is required and must be 50 characters or fewer')
  }
  if (body.price === undefined || body.price === null || String(body.price).trim() === ''
    || !Number.isFinite(price) || price < 0 || price > 99999999.99) {
    throw new HttpError(400, 'Product price must be a non-negative amount')
  }
  if ((typeof body.stock === 'string' && body.stock.trim() === '')
    || !Number.isInteger(stock) || stock < 0) {
    throw new HttpError(400, 'Product stock must be a non-negative whole number')
  }
  if (image.length > 255) {
    throw new HttpError(400, 'Product image URL must be 255 characters or fewer')
  }

  return { name, category, description, image, price: price.toFixed(2), stock }
}

router.get('/', asyncHandler(async (req, res) => {
  const [products] = await pool.execute(
    'SELECT id, name, category, price, image, description, stock FROM products ORDER BY id DESC',
  )
  return res.json(products)
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const [products] = await pool.execute(
    'SELECT id, name, category, price, image, description, stock FROM products WHERE id = ?',
    [req.params.id],
  )
  if (!products[0]) {
    throw new HttpError(404, 'Product not found')
  }
  return res.json(products[0])
}))

router.post('/', authenticateToken, requireSeller, asyncHandler(async (req, res) => {
  const product = parseProduct(req.body)
  const [result] = await pool.execute(
    `INSERT INTO products (name, category, price, image, description, stock)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [product.name, product.category, product.price, product.image, product.description, product.stock],
  )
  return res.status(201).json({ id: result.insertId, ...product })
}))

router.put('/:id', authenticateToken, requireSeller, asyncHandler(async (req, res) => {
  const product = parseProduct(req.body)
  const [result] = await pool.execute(
    `UPDATE products
     SET name = ?, category = ?, price = ?, image = ?, description = ?, stock = ?
     WHERE id = ?`,
    [
      product.name,
      product.category,
      product.price,
      product.image,
      product.description,
      product.stock,
      req.params.id,
    ],
  )
  if (result.affectedRows === 0) {
    const [existing] = await pool.execute('SELECT id FROM products WHERE id = ?', [req.params.id])
    if (!existing[0]) {
      throw new HttpError(404, 'Product not found')
    }
  }
  return res.json({ id: Number(req.params.id), ...product })
}))

router.delete('/:id', authenticateToken, requireSeller, asyncHandler(async (req, res) => {
  const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id])
  if (result.affectedRows === 0) {
    throw new HttpError(404, 'Product not found')
  }
  return res.status(204).end()
}))

module.exports = router
