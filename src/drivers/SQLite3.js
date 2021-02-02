const sqlite3 = require('sqlite3')
const fs = require('fs')
const { DATABASES_DIR  } = require('./../Constants')

if(!fs.existsSync(DATABASES_DIR)) fs.mkdirSync(DATABASES_DIR)

const db = new sqlite3.cached.Database(`${DATABASES_DIR}/syntax.db`)
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS votes (
            user_id TEXT PRIMARY KEY NOT NULL,
            count INTEGER DEFAULT 0
        )
    `)
})

module.exports = db
