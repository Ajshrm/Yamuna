const cors = require('cors')
const express = require('express')
const authRoutes = require('./routes/authRoutes')
const orderRoutes = require('./routes/orderRoutes')
const productRoutes = require('./routes/productRoutes')
const { errorHandler } = require('./middleware/errors')

const app = express()

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
}))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

app.use((req, res) => res.status(404).json({ error: 'Route not found' }))
app.use(errorHandler)

module.exports = app
