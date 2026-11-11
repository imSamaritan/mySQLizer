# Quick Start Guide

Get started with mySQLizer in minutes!

## Installation

```bash
npm install mysqlizer
```

## Basic Setup

### 1. Create a database connection

```javascript
import mySQLizer from 'mysqlizer'

// Create a model instance with your database configuration
const model = new mySQLizer({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})
```

### 2. Specify your table

```javascript
// Option 1: Use select() followed by from()
const users = await model.selectAll().from('users')

// Option 2: Use fromTable() at the start of the chain
const usersFromTable = await model.fromTable('users').selectAll()
```

## Common Operations

### SELECT Queries

```javascript
// Get all records
const allUsers = await model.fromTable('users').selectAll()

// Get specific columns
const names = await model.fromTable('users').select('name', 'email')

// Get distinct values
const uniqueCities = await model.fromTable('users').select().distinct('city')

// With WHERE clause
const user = await model
  .fromTable('users')
  .selectAll()
  .where('id', '=', { value: 1, type: 'number' })

// Multiple conditions
const results = await model
  .fromTable('users')
  .selectAll()
  .where('age', '>', { value: 18, type: 'number' })
  .andWhere('city', '=', { value: 'New York', type: 'string' })
```

### INSERT Queries

```javascript
// Insert a single record
const result = await model
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  })
  .into('users')

console.log('Inserted ID:', result.insertId)
```

### UPDATE Queries

```javascript
// Update records
const result = await model
  .update()
  .table('users')
  .set({ name: 'Jane Doe', age: 31 })
  .where('id', '=', { value: 1, type: 'number' })

console.log('Affected rows:', result.affectedRows)
```

### DELETE Queries

```javascript
// Delete records
const result = await model
  .delete()
  .from('users')
  .where('id', '=', { value: 1, type: 'number' })

console.log('Deleted rows:', result.affectedRows)
```

## Advanced Features

### Complex WHERE Conditions

```javascript
// IN operator
const users = await model
  .fromTable('users')
  .selectAll()
  .whereField('status').in(['active', 'pending'])

// NOT IN operator
const users = await model
  .fromTable('users')
  .selectAll()
  .whereField('role').notIn(['admin', 'moderator'])

// BETWEEN
const users = await model
  .fromTable('users')
  .selectAll()
  .whereField('age')
  .isBetween(18, 65)

// NULL checks
const users = await model
  .fromTable('users')
  .selectAll()
  .whereField('deleted_at')
  .isNull()
```

### Grouping Conditions

```javascript
// Complex query with grouped conditions
const results = await model
  .fromTable('users')
  .selectAll()
  .where('status', '=', { value: 'active', type: 'string' })
  .andGroup((builder) => 
    builder
      .where('age', '>', { value: 18, type: 'number' })
      .orWhere('verified', '=', { value: true, type: 'boolean' })
  )
```

### Ordering Results

```javascript
// Order by single column
const users = await model
  .fromTable('users')
  .selectAll()
  .orderBy({ created_at: 'DESC' })

// Order by multiple columns
const users = await model
  .fromTable('users')
  .selectAll()
  .orderBy('last_name', 'first_name')
```

### Limiting Results

```javascript
// Limit results
const topUsers = await model
  .fromTable('users')
  .selectAll()
  .orderBy({ score: 'DESC' })
  .limit(10)

// With offset (pagination)
const page2 = await model
  .fromTable('users')
  .selectAll()
  .limit(10)
  .offset(10)
```

## Complete Example

```javascript
import mySQLizer from 'mysqlizer'
import dotenv from 'dotenv'

dotenv.config()

// Initialize model
const model = new mySQLizer({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
})

async function getUserPosts(userId) {
  try {
    // Get user
    const [user] = await model
      .fromTable('users')
      .selectAll()
      .where('id', '=', { value: userId, type: 'number' })

    if (!user) {
      return null
    }

    // Get user's posts
    const posts = await model
      .fromTable('posts')
      .selectAll()
      .where('user_id', '=', { value: userId, type: 'number' })
      .andWhere('status', '=', { value: 'published', type: 'string' })
      .orderBy({ created_at: 'DESC' })
      .limit(10)

    return {
      user,
      posts
    }
  } catch (error) {
    console.error('Error:', error.message)
    throw error
  }
}

// Use the function
getUserPosts(1).then(result => {
  console.log(result)
})
```

## Express.js Integration

```javascript
import express from 'express'
import mySQLizer from 'mysqlizer'

const app = express()
const model = new mySQLizer({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

app.use(express.json())

// GET all users
app.get('/users', async (req, res) => {
  try {
    const users = await model.fromTable('users').selectAll()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET single user
app.get('/users/:id', async (req, res) => {
  try {
    const [user] = await model
      .fromTable('users')
      .selectAll()
      .where('id', '=', { value: req.params.id, type: 'number' })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create user
app.post('/users', async (req, res) => {
  try {
    const result = await model
      .insert(req.body)
      .into('users')

    res.status(201).json({ 
      id: result.insertId,
      message: 'User created successfully' 
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update user
app.put('/users/:id', async (req, res) => {
  try {
    const result = await model
      .update()
      .table('users')
      .set(req.body)
      .where('id', '=', { value: req.params.id, type: 'number' })

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ message: 'User updated successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE user
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await model
      .delete()
      .from('users')
      .where('id', '=', { value: req.params.id, type: 'number' })

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...')
  process.exit(0)
})
```

## Environment Variables

Create a `.env` file in your project root:

```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
PORT=3000
```

## Debugging

Enable debug mode to see SQL queries:

```bash
# Unix/Mac
DEBUG=mySQLizer:* node your-app.js

# Windows (CMD)
set DEBUG=mySQLizer:* && node your-app.js

# Windows (PowerShell)
$env:DEBUG="mySQLizer:*"; node your-app.js
```

## Tips

1. **Use Type Safety**: Always specify the type when using WHERE conditions
   ```javascript
   .where('age', '=', { value: 25, type: 'number' })
   ```

2. **Chain Methods**: mySQLizer uses an immutable builder pattern
   ```javascript
   const query = model.fromTable('users').selectAll()
   const withWhere = query.where('age', '>', { value: 18, type: 'number' })
   const withOrder = withWhere.orderBy({ name: 'ASC' })
   ```

3. **Promise Interface**: You can await directly or call `.done()`
   ```javascript
   // Both work the same
   const results = await model.fromTable('users').selectAll()
   const results = await model.fromTable('users').selectAll().done()
   ```

4. **Connection Pool**: The connection pool is managed automatically
   - No need to manually open/close connections
   - Shared across all mySQLizer instances
   - Automatically cleaned up on process exit

## Next Steps

- Check the full [README.md](README.md) for complete API documentation
- Report issues on [GitHub](https://github.com/imSamaritan/mySQLizer/issues)

## Need Help?

- 📖 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/imSamaritan/mySQLizer/issues)
- 💬 [Discussions](https://github.com/imSamaritan/mySQLizer/discussions)

---

Happy coding! 🚀