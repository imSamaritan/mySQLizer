# Installation Guide - mySQLizer

Quick reference guide for installing and setting up mySQLizer in your Node.js project.

---

## 📦 NPM Installation

### Install via NPM

```bash
npm install mysqlizer
```

### Install via Yarn

```bash
yarn add mysqlizer
```

### Install via pnpm

```bash
pnpm add mysqlizer
```

---

## 📋 What's Included

When you install `mysqlizer`, these dependencies are automatically included:

- ✅ **mysql2** - MySQL driver with promise support
- ✅ **debug** - Debugging utility for development
- ✅ **@dotenvx/dotenvx** - Environment variable management

**No additional installations required!**

---

## ⚙️ Configuration

### 1. Create Environment File

Create a `.env` file in your project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
CONNECTION_LIMIT=10
```

### 2. Import and Initialize

```javascript
import mySQLizer from 'mysqlizer'

// Uses environment variables automatically
const db = new mySQLizer()
```

### 3. Custom Configuration (Optional)

Override environment variables with custom options:

```javascript
import mySQLizer from 'mysqlizer'

const db = new mySQLizer({
  host: 'custom-host.com',
  user: 'custom-user',
  password: 'custom-password',
  database: 'custom-database',
  port: 3306,
  connectionLimit: 20
})
```

---

## ✅ Verify Installation

Test your setup with a simple query:

```javascript
import mySQLizer from 'mysqlizer'

const db = new mySQLizer()

try {
  const result = await db.fromTable('users').countRecords()
  console.log('✅ mySQLizer connected successfully!')
  console.log('Total users:', result[0].recordsCount)
} catch (error) {
  console.error('❌ Connection failed:', error.message)
}
```

---

## 🔧 System Requirements

- **Node.js**: >= 14.0.0
- **MySQL**: 5.7+ or 8.0+
- **Package Manager**: npm, yarn, or pnpm

---

## 🚨 Troubleshooting

### Issue: "Cannot find module 'mysqlizer'"

**Solution:**
```bash
# Reinstall the package
npm install mysqlizer

# Clear npm cache if needed
npm cache clean --force
npm install mysqlizer
```

### Issue: "Connection failed: Access denied"

**Solution:**
- Check your `.env` file credentials
- Verify MySQL user has proper permissions
- Ensure MySQL server is running

```bash
# Test MySQL connection
mysql -u root -p
```

### Issue: "Error: Cannot find module 'mysql2'"

**Solution:**
```bash
# Install mysql2 explicitly (peer dependency)
npm install mysql2
```

### Issue: "Database does not exist"

**Solution:**
```sql
-- Create database in MySQL
CREATE DATABASE your_database;

-- Grant permissions
GRANT ALL PRIVILEGES ON your_database.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📚 Quick Start

### Basic Query Example

```javascript
import mySQLizer from 'mysqlizer'

const db = new mySQLizer()

// SELECT
const users = await db
  .fromTable('users')
  .select('id', 'name', 'email')
  .where('status', '=', 'active')
  .limit(10)

// INSERT
const result = await db
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
  })
  .into('users')

// UPDATE
await db
  .update()
  .table('users')
  .set({ status: 'inactive' })
  .where('id', '=', { value: 1, type: 'number' })

// DELETE
await db
  .fromTable('users')
  .delete()
  .where('status', '=', 'banned')
```

---

## 🔍 Debug Mode

Enable debug logging to see SQL queries:

```bash
# Unix/Linux/Mac
DEBUG=mySQLizer:* node app.js

# Windows (CMD)
set DEBUG=mySQLizer:* && node app.js

# Windows (PowerShell)
$env:DEBUG="mySQLizer:*"; node app.js
```

**Available Debug Namespaces:**
- `mySQLizer:query` - SQL queries and values
- `mySQLizer:db` - Connection pool events
- `mySQLizer:options` - Configuration options

---

## 🌐 Express.js Integration

```javascript
import express from 'express'
import mySQLizer from 'mysqlizer'

const app = express()
const db = new mySQLizer()

app.use(express.json())

app.get('/users', async (req, res) => {
  try {
    const users = await db.fromTable('users').selectAll()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

---

## 📦 Package Information

- **Package Name:** `mysqlizer`
- **Current Version:** 1.1.0
- **NPM:** https://www.npmjs.com/package/mysqlizer
- **License:** MIT
- **Repository:** https://github.com/imSamaritan/mySQLizer

---

## 🎓 Next Steps

1. ✅ Install mysqlizer: `npm install mysqlizer`
2. ✅ Configure `.env` file
3. ✅ Test connection
4. 📖 Read the [full documentation](README.md)
5. 🚀 Start building queries!

---

## 💡 Need Help?

- 📖 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/imSamaritan/mySQLizer/issues)
- 💬 [Discussions](https://github.com/imSamaritan/mySQLizer/discussions)
- 📚 [API Reference](README.md#api-reference)

---

**mySQLizer** - Simple, fluent MySQL query building for Node.js

*Installation complete! Happy coding! 🚀*