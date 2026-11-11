require('dotenv').config()

const app = require('./app')
const pool = require('./config/db')

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 characters')
  }

  const connection = await pool.getConnection()
  connection.release()

  const port = Number(process.env.PORT || 5000)
  app.listen(port, () => {
    console.log(`Shop API running on http://localhost:${port}`)
  })
}

startServer().catch((error) => {
  console.error('Unable to start the Shop API:', error.message)
  process.exitCode = 1
})
