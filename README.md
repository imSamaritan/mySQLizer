<div align="center">

<img src="https://raw.githubusercontent.com/imSamaritan/mySQLizer/master/assets/mysqlizer-logo.png" alt="mySQLizer Logo" width="400">

# mySQLizer

**A lightweight, fluent MySQL query builder for Node.js**

Automatic connection pool management • Immutable builder pattern • Promise-based API

[![npm version](https://badge.fury.io/js/mysqlizer.svg)](https://www.npmjs.com/package/mysqlizer)
[![npm downloads](https://img.shields.io/npm/dm/mysqlizer.svg)](https://www.npmjs.com/package/mysqlizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org)

</div>

---

## What is mySQLizer?

**mySQLizer is a MySQL query builder**, not a full-featured ORM. It provides a clean, chainable API for building and executing MySQL queries without the complexity and overhead of traditional ORMs. Perfect for developers who want more control than raw SQL strings but less abstraction than TypeORM or Sequelize.

### Query Builder vs ORM

- ✅ **Query Builder** (mySQLizer): Fluent API for building SQL queries, direct database interaction
- ❌ **ORM**: Model definitions, relationships, migrations, schema management, active records

## Features

- **Immutable Builder Pattern**: Each query method returns a new instance, preserving immutability
- **Fluent Chainable API**: Readable methods for building SQL queries
- **Promise-based Interface**: Await queries directly or call `.done()` explicitly
- **Singleton Connection Pool**: Single shared pool across all mySQLizer instances with automatic cleanup
- **Flexible WHERE Conditions**: Support for complex conditions with operators, IN/NOT IN, NULL checks, and BETWEEN ranges
- **Logical Operators**: Chain conditions with AND/OR operators and grouped conditions
- **Field-based Conditions**: Use `whereField()` for specialized operations
- **Type Casting**: Explicit type conversion for query values
- **Auto Resource Management**: Connection pool automatically closes on process exit
- **Debug Support**: Built-in debugging with the `debug` package
- **ES6 Module Support**: Full ESM compatibility

## Installation

Install mySQLizer from npm:

```bash
npm install mysqlizer
```

**What's included:**
- ✅ mySQLizer query builder core
- ✅ mysql2 (MySQL driver with promise support)
- ✅ debug (debugging utility)
- ✅ @dotenvx/dotenvx (environment variable management)

**Note:** `mysql2` is a peer dependency and is required for mySQLizer to work.

## Getting Started

### Step 1: Install the package

```bash
npm install mysqlizer
```

### Step 2: Set up your environment variables

Create a `.env` file in your project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
CONNECTION_LIMIT=10
```

### Step 3: Import and use mySQLizer

```javascript
import mySQLizer from 'mysqlizer'

// Create a new instance (uses environment variables automatically)
const db = new mySQLizer()

// Start building queries!
const users = await db
  .select('*')
  .from('users')
  .where('status', '=', 'active')
```

### Step 4: Optional - Custom configuration

Override environment variables with custom options:

```javascript
const db = new mySQLizer({
  host: 'custom-host.com',
  user: 'custom-user',
  password: 'custom-password',
  database: 'custom-database',
  port: 3306,
  connectionLimit: 20
})
```

## Quick Start Examples

```javascript
import mySQLizer from 'mysqlizer'

const db = new mySQLizer()

// SELECT queries - use select() followed by from()
const allUsers = await db.selectAll().from('users')

const activeUsers = await db
  .select('id', 'name', 'email')
  .from('users')
  .where('status', '=', 'active')

// Alternative: use fromTable() to start the chain
const posts = await db.fromTable('posts').select('id', 'title')

// INSERT queries - use insert() followed by into()
const insertResult = await db
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
  })
  .into('users')

console.log('New user ID:', insertResult.insertId)

// UPDATE queries - use update().table().set()
const updateResult = await db
  .update()
  .table('users')
  .set({ 
    status: 'inactive', 
    updated_at: new Date() 
  })
  .where('last_login', '<', '2025-01-01')

console.log('Rows updated:', updateResult.affectedRows)

// DELETE queries - use delete().from()
const deleteResult = await db
  .delete()
  .from('users')
  .where('status', '=', 'deleted')

console.log('Rows deleted:', deleteResult.affectedRows)

// Complex conditions with grouped logic
const complexUsers = await db
  .select('id', 'name', 'role')
  .from('users')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .whereField('role').in(['admin', 'moderator'])
      .orWhere('department', '=', 'IT')
  })
```

## API Reference

### Core Methods

#### `new mySQLizer(options?)`

Create a new mySQLizer instance with optional database configuration.

```javascript
// Use environment variables
const db = new mySQLizer()

// Override with custom options
const db = new mySQLizer({
  host: 'custom-host',
  user: 'custom-user',
  password: 'custom-password',
  database: 'custom-database',
  port: 3306,
  connectionLimit: 10
})
```

#### `from(tableName)`

Specifies the table to query. Works with `select()`, `delete()`, and `countRecords()` operations.

```javascript
// Use with select
const users = await db.select('*').from('users')

// Use with delete
const result = await db.delete().from('inactive_users')

// Use with countRecords
const count = await db.countRecords().from('users')
```

#### `fromTable(tableName)`

Alternative method to start a query chain. Must be called first in the chain. Works as a shorthand for setting the table at the beginning.

```javascript
// SELECT queries
const users = await db.fromTable('users').selectAll()
const posts = await db.fromTable('posts').select('id', 'title')

// DELETE queries
const result = await db.fromTable('inactive_users').delete()
```

**Note:** `fromTable()` must be the first method in the chain, while `from()` is used after query methods like `select()`, `delete()`, or `countRecords()`.

#### `table(tableName)`

Specifies the table for `update()` operations. Must be chained after `update()`.

```javascript
const result = await db
  .update()
  .table('users')
  .set({ status: 'inactive' })
  .where('id', '=', 1)
```

#### `done()`

Executes the query and returns results. Queries can also be awaited directly without calling `.done()`.

```javascript
// With done()
const results = await db.select('*').from('users').done()

// Without done() (recommended)
const results = await db.select('*').from('users')
```

---

### Query Building Methods

#### `select(...columns)`

Selects specific columns from the table. Can be called without arguments.

```javascript
// Single column
const names = await db.select('name').from('users')

// Multiple columns
const users = await db.select('id', 'name', 'email').from('users')

// Without arguments (used with distinct)
const unique = await db.select().distinct('email').from('users')
```

#### `selectAll()`

Selects all columns (`SELECT *`).

```javascript
const allUsers = await db.selectAll().from('users')
```

#### `distinct(...columns)`

Selects distinct/unique values.

```javascript
// Single column
const uniqueEmails = await db.select().distinct('email').from('users')

// Multiple columns
const uniquePairs = await db.select().distinct('city', 'country').from('addresses')
```

#### `countRecords()`

Counts total records. Returns result with `recordsCount` property.

```javascript
const result = await db.countRecords().from('users')
console.log('Total users:', result[0].recordsCount)

// With conditions
const activeCount = await db
  .countRecords()
  .from('users')
  .where('status', '=', 'active')
```

---

### Data Modification Methods

#### `insert(data)`

Inserts a new record. Must be followed by `into()`.

```javascript
const result = await db
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
  })
  .into('users')

console.log('Inserted ID:', result.insertId)
```

#### `into(tableName)`

Specifies the table for insert operations. Must be chained after `insert()`.

```javascript
const result = await db
  .insert({ title: 'New Post', body: 'Content here' })
  .into('posts')
```

#### `update()`

Starts an update query. Takes no arguments. Must be chained with `table()` and `set()`.

```javascript
const result = await db
  .update()
  .table('users')
  .set({ status: 'inactive' })
  .where('id', '=', 1)

console.log('Rows affected:', result.affectedRows)
```

#### `set(data)`

Sets the data to update. Must be chained after `update().table()`.

```javascript
const result = await db
  .update()
  .table('users')
  .set({
    name: 'Jane Doe',
    email: 'jane@example.com',
    updated_at: new Date()
  })
  .where('id', '=', 5)
```

#### `delete()`

Starts a delete query. Can be followed by `from()` or used with `fromTable()`.

```javascript
// Pattern 1: delete().from()
const result = await db
  .delete()
  .from('users')
  .where('status', '=', 'deleted')

// Pattern 2: fromTable().delete()
const result = await db
  .fromTable('users')
  .delete()
  .where('status', '=', 'deleted')

console.log('Rows deleted:', result.affectedRows)
```

---

### WHERE Conditions

#### `where(column, operator, value)`

Adds a WHERE condition. First WHERE in the chain.

```javascript
// Basic comparison
await db.select('*').from('users').where('status', '=', 'active')

// Greater than
await db.select('*').from('users').where('age', '>', 18)

// LIKE operator
await db.select('*').from('users').where('name', 'LIKE', '%John%')
```

**Supported operators:**
- `=`, `!=`, `<>`, `>`, `>=`, `<`, `<=`
- `LIKE`, `NOT LIKE`

**Type casting:**

```javascript
// Cast string to number
await db
  .select('*')
  .from('users')
  .where('age', '>', { value: '18', type: 'number' })

// Cast string to boolean
await db
  .select('*')
  .from('users')
  .where('verified', '=', { value: 'true', type: 'boolean' })
```

#### `whereField(column)`

Starts a field-based condition. Must be followed by field operators like `isNull()`, `in()`, etc.

```javascript
// Check for NULL
await db
  .select('*')
  .from('users')
  .whereField('deleted_at')
  .isNull()

// Use IN operator
await db
  .select('*')
  .from('posts')
  .whereField('status')
  .in(['published', 'featured'])

// Use BETWEEN
await db
  .select('*')
  .from('products')
  .whereField('price')
  .isBetween(10, 100)
```

#### `andWhere(column, operator, value)`

Adds an AND WHERE condition.

```javascript
await db
  .select('*')
  .from('users')
  .where('status', '=', 'active')
  .andWhere('role', '=', 'admin')
// SQL: WHERE status = 'active' AND role = 'admin'
```

#### `orWhere(column, operator, value)`

Adds an OR WHERE condition.

```javascript
await db
  .select('*')
  .from('users')
  .where('role', '=', 'admin')
  .orWhere('role', '=', 'moderator')
// SQL: WHERE role = 'admin' OR role = 'moderator'
```

#### `and()`

Adds an AND logical operator.

```javascript
await db
  .select('*')
  .from('users')
  .where('status', '=', 'active')
  .and()
  .where('verified', '=', true)
```

#### `or()`

Adds an OR logical operator.

```javascript
await db
  .select('*')
  .from('users')
  .where('role', '=', 'admin')
  .or()
  .where('role', '=', 'moderator')
```

---

### Grouped Conditions

#### `andGroup(callback)`

Creates an AND grouped condition with parentheses.

```javascript
await db
  .select('*')
  .from('users')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .orWhere('department', '=', 'IT')
  })
// SQL: WHERE status = 'active' AND (role = 'admin' OR department = 'IT')
```

#### `orGroup(callback)`

Creates an OR grouped condition with parentheses.

```javascript
await db
  .select('*')
  .from('posts')
  .where('status', '=', 'published')
  .orGroup((builder) => {
    return builder
      .where('featured', '=', true)
      .andWhere('priority', '>', 5)
  })
// SQL: WHERE status = 'published' OR (featured = true AND priority > 5)
```

**Nested groups:**

```javascript
await db
  .select('*')
  .from('users')
  .where('active', '=', true)
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'manager')
      .orGroup((nested) => {
        return nested
          .where('department', '=', 'IT')
          .andWhere('level', '>=', 5)
      })
  })
```

---

### Field Operators

These operators work with `whereField()`:

#### `isNull()`

Checks if a field is NULL.

```javascript
await db
  .select('*')
  .from('users')
  .whereField('deleted_at')
  .isNull()
// SQL: WHERE deleted_at IS NULL
```

#### `isNotNull()`

Checks if a field is NOT NULL.

```javascript
await db
  .select('*')
  .from('users')
  .whereField('email_verified_at')
  .isNotNull()
// SQL: WHERE email_verified_at IS NOT NULL
```

#### `in(list)`

Checks if a field value is in a list.

```javascript
await db
  .select('*')
  .from('users')
  .whereField('role')
  .in(['admin', 'moderator', 'editor'])
// SQL: WHERE role IN ('admin', 'moderator', 'editor')
```

#### `notIn(list)`

Checks if a field value is NOT in a list.

```javascript
await db
  .select('*')
  .from('users')
  .whereField('status')
  .notIn(['banned', 'deleted', 'suspended'])
// SQL: WHERE status NOT IN ('banned', 'deleted', 'suspended')
```

#### `isBetween(start, end)`

Checks if a field value is between two numbers.

```javascript
await db
  .select('*')
  .from('products')
  .whereField('price')
  .isBetween(10, 100)
// SQL: WHERE price BETWEEN 10 AND 100
```

#### `isNotBetween(start, end)`

Checks if a field value is NOT between two numbers.

```javascript
await db
  .select('*')
  .from('products')
  .whereField('price')
  .isNotBetween(10, 100)
// SQL: WHERE price NOT BETWEEN 10 AND 100
```

---

### Traditional IN/NOT IN Methods

#### `whereIn(column, list)`

Alternative IN syntax without `whereField()`.

```javascript
await db
  .select('*')
  .from('users')
  .whereIn('role', ['admin', 'moderator'])
```

#### `whereNotIn(column, list)`

Alternative NOT IN syntax without `whereField()`.

```javascript
await db
  .select('*')
  .from('users')
  .whereNotIn('status', ['banned', 'deleted'])
```

---

### Query Modifiers

#### `limit(number)`

Limits the number of results.

```javascript
await db
  .select('*')
  .from('users')
  .limit(10)
// SQL: SELECT * FROM users LIMIT 10
```

#### `offset(number)`

Skips a number of results. Must be used with `limit()`.

```javascript
await db
  .select('*')
  .from('users')
  .limit(10)
  .offset(20)
// SQL: SELECT * FROM users LIMIT 10 OFFSET 20
```

#### `orderBy(...sort)`

Orders results by columns.

```javascript
// Single column (ascending by default)
await db
  .select('*')
  .from('users')
  .orderBy('name')

// Multiple columns
await db
  .select('*')
  .from('users')
  .orderBy('name', 'email')

// With direction (object syntax)
await db
  .select('*')
  .from('users')
  .orderBy({ name: 'ASC' }, { created_at: 'DESC' })

// Mixed syntax
await db
  .select('*')
  .from('products')
  .orderBy('category', { price: 'DESC' })
```

---

## Query Patterns

### SELECT Queries

```javascript
// Pattern 1: select() → from()
await db.select('id', 'name').from('users')

// Pattern 2: fromTable() → select()
await db.fromTable('users').select('id', 'name')

// With conditions
await db
  .select('*')
  .from('users')
  .where('status', '=', 'active')
  .orderBy({ created_at: 'DESC' })
  .limit(10)
```

### INSERT Queries

```javascript
// Pattern: insert() → into()
await db
  .insert({
    name: 'John Doe',
    email: 'john@example.com'
  })
  .into('users')
```

### UPDATE Queries

```javascript
// Pattern: update() → table() → set() → where()
await db
  .update()
  .table('users')
  .set({
    status: 'inactive',
    updated_at: new Date()
  })
  .where('id', '=', 1)
```

### DELETE Queries

```javascript
// Pattern 1: delete() → from()
await db
  .delete()
  .from('users')
  .where('status', '=', 'deleted')

// Pattern 2: fromTable() → delete()
await db
  .fromTable('users')
  .delete()
  .where('status', '=', 'deleted')
```

---

## Complete Examples

### User Management API

```javascript
import express from 'express'
import mySQLizer from 'mysqlizer'

const app = express()
const db = new mySQLizer()

app.use(express.json())

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await db.selectAll().from('users')
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const users = await db
      .select('*')
      .from('users')
      .where('id', '=', { value: req.params.id, type: 'number' })
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(users[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create new user
app.post('/users', async (req, res) => {
  try {
    const { name, email, status } = req.body
    const result = await db
      .insert({ name, email, status })
      .into('users')
    
    res.status(201).json({
      id: result.insertId,
      message: 'User created successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update user
app.put('/users/:id', async (req, res) => {
  try {
    const result = await db
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

// Delete user
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await db
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

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

### Complex Query Examples

```javascript
// Search with multiple conditions
const searchUsers = await db
  .select('id', 'name', 'email', 'role')
  .from('users')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .where('name', 'LIKE', '%John%')
      .orWhere('email', 'LIKE', '%john%')
  })
  .orderBy({ created_at: 'DESC' })
  .limit(20)

// Get users with specific roles and departments
const filteredUsers = await db
  .select('*')
  .from('users')
  .whereField('role')
  .in(['admin', 'moderator', 'editor'])
  .and()
  .whereField('department')
  .notIn(['archived', 'inactive'])
  .orderBy('name')

// Count active users by role
const adminCount = await db
  .countRecords()
  .from('users')
  .where('role', '=', 'admin')
  .andWhere('status', '=', 'active')

// Get recent posts with pagination
const recentPosts = await db
  .select('id', 'title', 'author', 'created_at')
  .from('posts')
  .where('published', '=', true)
  .orderBy({ created_at: 'DESC' })
  .limit(10)
  .offset(0)

// Bulk update with conditions
const bulkUpdate = await db
  .update()
  .table('users')
  .set({
    status: 'verified',
    verified_at: new Date()
  })
  .whereField('email_verified')
  .isNotNull()
  .and()
  .where('status', '=', 'pending')
```

---

## Debugging

mySQLizer uses the `debug` package for logging. Enable debug output:

```bash
# Enable all mySQLizer debug output
DEBUG=mysqlizer:* node app.js

# Enable specific namespaces
DEBUG=mysqlizer:query node app.js

# Enable all debug output (including dependencies)
DEBUG=* node app.js
```

**In your code:**

```javascript
import debug from 'debug'

const myDebug = debug('myapp:database')

const users = await db.select('*').from('users')
myDebug('Fetched %d users', users.length)
```

---

## Connection Pool Management

mySQLizer uses a **singleton connection pool** that is automatically shared across all instances:

```javascript
const db1 = new mySQLizer()
const db2 = new mySQLizer()
// Both instances share the same connection pool
```

**Automatic cleanup:**
- Pool closes automatically on process exit
- Handles `SIGINT` (Ctrl+C) and `SIGTERM` signals
- No manual cleanup required

```javascript
// No need to manually close connections!
// This is handled automatically:
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...')
  // Connection pool closes automatically
  process.exit(0)
})
```

---

## Error Handling

```javascript
try {
  const users = await db
    .select('*')
    .from('users')
    .where('status', '=', 'active')
} catch (error) {
  console.error('Query failed:', error.message)
  
  // Handle specific error types
  if (error.code === 'ER_NO_SUCH_TABLE') {
    console.error('Table does not exist')
  }
}
```

**Common errors:**
- `ER_NO_SUCH_TABLE`: Table doesn't exist
- `ER_BAD_FIELD_ERROR`: Column doesn't exist
- `ER_DUP_ENTRY`: Duplicate entry (unique constraint violation)
- `ER_ACCESS_DENIED_ERROR`: Invalid credentials

---

## Best Practices

### 1. Use Type Casting for Safety

```javascript
// Cast string IDs to numbers
await db
  .select('*')
  .from('users')
  .where('id', '=', { value: userId, type: 'number' })
```

### 2. Use Field Operators for Readability

```javascript
// Prefer this:
await db.select('*').from('users').whereField('role').in(['admin', 'moderator'])

// Over this:
await db.select('*').from('users').whereIn('role', ['admin', 'moderator'])
```

### 3. Use Grouped Conditions for Complex Logic

```javascript
await db
  .select('*')
  .from('users')
  .where('active', '=', true)
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .orWhere('permissions', 'LIKE', '%superuser%')
  })
```

### 4. Always Handle Errors

```javascript
try {
  const result = await db.select('*').from('users')
  // Process result
} catch (error) {
  console.error('Database error:', error)
  // Handle error appropriately
}
```

### 5. Use Environment Variables

```javascript
// Don't hardcode credentials
const db = new mySQLizer({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})
```

---

## Performance Tips

### 1. Use SELECT with Specific Columns

```javascript
// Prefer this:
await db.select('id', 'name', 'email').from('users')

// Over this:
await db.selectAll().from('users')
```

### 2. Use LIMIT for Large Datasets

```javascript
await db
  .select('*')
  .from('large_table')
  .limit(100)
```

### 3. Use Indexes on WHERE Columns

Make sure columns used in WHERE clauses are indexed in your MySQL database.

### 4. Reuse mySQLizer Instance

```javascript
// Create once, reuse everywhere
const db = new mySQLizer()

export default db
```

---

## Limitations

- **No JOIN support**: mySQLizer doesn't support JOIN operations yet
- **No GROUP BY/HAVING**: Aggregate functions are limited
- **No subqueries**: Complex nested queries are not supported
- **No transactions**: No transaction management built-in
- **Single database**: One instance per database connection

For complex queries requiring these features, consider using raw SQL with the `mysql2` library directly.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- 📖 **Documentation**: [GitHub Repository](https://github.com/imSamaritan/mySQLizer)
- 🐛 **Issues**: [Report a bug](https://github.com/imSamaritan/mySQLizer/issues)
- 💬 **Discussions**: [Join the conversation](https://github.com/imSamaritan/mySQLizer/discussions)

---

<div align="center">

**mySQLizer** - Simple, fluent MySQL query building for Node.js

Built with ❤️ for developers who love SQL

</div>