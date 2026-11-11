const express = require('express')
const pool = require('../config/db')
const { authenticateToken, requireSeller, requireCustomer } = require('../middleware/auth')
const { asyncHandler, HttpError } = require('../middleware/errors')

const router = express.Router()

router.post('/', authenticateToken, requireCustomer, asyncHandler(async (req, res) => {
  const body = req.body || {}
  const items = body.items
  const customerName = typeof body.name === 'string' ? body.name.trim() : ''
  const customerEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const address = typeof body.address === 'string' ? body.address.trim() : ''

  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    throw new HttpError(400, 'Order must contain between 1 and 100 items')
  }
  if (!customerName || customerName.length > 100
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) || customerEmail.length > 254) {
    throw new HttpError(400, 'A valid customer name and email are required')
  }
  if (!address || address.length > 1000) {
    throw new HttpError(400, 'A shipping address is required')
  }

  const quantities = new Map()
  for (const item of items) {
    const productId = Number(item.productId)
    const quantity = Number(item.quantity)
    if (!Number.isInteger(productId) || productId <= 0
      || !Number.isInteger(quantity) || quantity <= 0 || quantity > 1000) {
      throw new HttpError(400, 'Each order item requires a valid productId and positive quantity')
    }
    quantities.set(productId, (quantities.get(productId) || 0) + quantity)
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const productIds = [...quantities.keys()]
    const [products] = await connection.query(
      'SELECT id, name, price, stock FROM products WHERE id IN (?) FOR UPDATE',
      [productIds],
    )
    if (products.length !== productIds.length) {
      throw new HttpError(400, 'One or more products are unavailable')
    }

    let totalCents = 0
    const orderItems = products.map((product) => {
      const quantity = quantities.get(product.id)
      if (quantity > product.stock) {
        throw new HttpError(409, `Not enough stock for ${product.name}`)
      }
      const priceCents = Math.round(Number(product.price) * 100)
      totalCents += priceCents * quantity
      return {
        productId: product.id,
        name: product.name,
        quantity,
        price: (priceCents / 100).toFixed(2),
      }
    })

    const [orderResult] = await connection.execute(
      `INSERT INTO orders (user_id, total, customer_name, customer_email, shipping_address)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, (totalCents / 100).toFixed(2), customerName, customerEmail, address],
    )
    const orderId = orderResult.insertId
    const orderItemValues = orderItems.map((item) => [
      orderId,
      item.productId,
      item.quantity,
      item.price,
    ])
    await connection.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
      [orderItemValues],
    )
    for (const item of orderItems) {
      await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId],
      )
    }

    await connection.commit()
    return res.status(201).json({
      id: orderId,
      customer: { name: customerName, email: customerEmail, address },
      items: orderItems.map((item) => ({
        id: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      total: totalCents / 100,
      status: 'Placed',
    })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}))

router.get('/', authenticateToken, requireSeller, asyncHandler(async (req, res) => {
  const [orders] = await pool.execute(
    `SELECT id, total, status, created_at, customer_name, customer_email, shipping_address
     FROM orders
     ORDER BY created_at DESC`,
  )
  if (orders.length === 0) {
    return res.json([])
  }

  const orderIds = orders.map((order) => order.id)
  const [items] = await pool.query(
    `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id IN (?)
     ORDER BY oi.id`,
    [orderIds],
  )
  const itemsByOrder = new Map()
  for (const item of items) {
    const orderItems = itemsByOrder.get(item.order_id) || []
    orderItems.push({
      id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })
    itemsByOrder.set(item.order_id, orderItems)
  }

  return res.json(orders.map((order) => ({
    id: order.id,
    customer: {
      name: order.customer_name,
      email: order.customer_email,
      address: order.shipping_address,
    },
    items: itemsByOrder.get(order.id) || [],
    total: order.total,
    status: order.status,
    date: order.created_at,
  })))
}))

router.patch('/:id/complete', authenticateToken, requireSeller, asyncHandler(async (req, res) => {
  const [result] = await pool.execute(
    "UPDATE orders SET status = 'Completed' WHERE id = ? AND status <> 'Completed'",
    [req.params.id],
  )
  if (result.affectedRows === 0) {
    const [orders] = await pool.execute('SELECT id, status FROM orders WHERE id = ?', [req.params.id])
    if (!orders[0]) {
      throw new HttpError(404, 'Order not found')
    }
    return res.json(orders[0])
  }

  return res.json({ id: Number(req.params.id), status: 'Completed' })
}))

router.get('/my', authenticateToken, requireCustomer, asyncHandler(async (req, res) => {
  const [orders] = await pool.execute(
    `SELECT id, total, status, created_at, customer_name, customer_email, shipping_address
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [req.user.id],
  )
  if (orders.length === 0) {
    return res.json([])
  }

  const orderIds = orders.map((order) => order.id)
  const [items] = await pool.query(
    `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id IN (?)
     ORDER BY oi.id`,
    [orderIds],
  )
  const itemsByOrder = new Map()
  for (const item of items) {
    const orderItems = itemsByOrder.get(item.order_id) || []
    orderItems.push({
      id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })
    itemsByOrder.set(item.order_id, orderItems)
  }

  return res.json(orders.map((order) => ({
    id: order.id,
    customer: {
      name: order.customer_name,
      email: order.customer_email,
      address: order.shipping_address,
    },
    items: itemsByOrder.get(order.id) || [],
    total: order.total,
    status: order.status,
    date: order.created_at,
  })))
}))

module.exports = router
