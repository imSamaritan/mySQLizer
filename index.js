import express from 'express'
import dotenv from '@dotenvx/dotenvx'
import mySQLizer from './mySQLizer.js'

dotenv.config()

const db = new mySQLizer()
/**
 * mySQLizer Auto-closing Demo Server
 *
 * This example demonstrates how mySQLizer automatically handles
 * connection pool lifecycle without requiring manual cleanup.
 *
 * Features demonstrated:
 * - Multiple db instances sharing the same connection pool
 * - Automatic cleanup on server shutdown (Ctrl+C)
 * - No manual .close() or .end() methods needed
 */

const PORT = process.env.PORT || 3000
const app = express()

app.use(express.json())

//Get all posts
app.get('/', async (req, res) => {
  try {
    const results = await db.selectAll().from(`posts`)
    return res.json(results)
  } catch (error) {
    return res.status(400).json({ warning: error.message })
  }
})

//Get single post using id
app.get('/posts/:id', async (req, res) => {
  const id = req.params.id

  try {
    const results = await db
      .selectAll()
      .from(`posts`)
      .where(`post_id`, `=`, { value: id, type: `number` })

    return res.json(results)
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
})

// Create post
app.post('/posts', async (req, res) => {
  const { post_author, post_title, post_body, post_likes } = req.body
  try {
    const results = await db
      .insert({ post_author, post_title, post_body, post_likes })
      .into(`posts`)

    return res
      .status(201)
      .json({ post_id: results.insertId, post_status: 'created' })
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
})

// Update post using an {id}
app.put('/posts/:id', async (req, res) => {
  const id = req.params.id
  const data = req.body

  try {
    const results = await db
      .update()
      .table(`posts`)
      .set(data)
      .where(`post_id`, `=`, { value: id, type: `number` })

    if (results.affectedRows > 0) return res.redirect('/posts/' + id)
    else res.json({ error: `Something went wrong, post is not updated` })
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
})

// Delete post using an {id}
app.delete('/posts/:id', async (req, res) => {
  const id = req.params.id
  try {
    const results = await db
      .delete()
      .from(`posts`)
      .where(`post_id`, `=`, { value: id, type: 'number' })

    if (results.affectedRows > 0)
      return res.json({ post_id: id, post_status: 'removed' })
    else res.json({ error: `Something went wrong, post is not removed` })
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
})

const server = app.listen(PORT, () => {
  console.log(`\n🌐 Server running on port ${PORT}`)
  console.log('\n💡 Try pressing Ctrl+C to see automatic cleanup in action!')
})

// Demonstrate graceful shutdown (auto-closing in action)
process.on('SIGINT', () => {
  console.log('\n\n🛑 Received shutdown signal (Ctrl+C)')
  console.log('🔄 Shutting down server gracefully...')

  server.close(() => {
    console.log('✅ HTTP server closed')
    console.log('🔌 Connection pool will close automatically...')
    console.log('👋 Goodbye!')
    // No need to manually close database connections - auto-closing handles it!
  })
})

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Received SIGTERM signal')
  console.log('🔄 Shutting down server gracefully...')

  server.close(() => {
    console.log('✅ HTTP server closed')
    console.log('🔌 Connection pool cleanup handled automatically')
  })
})
