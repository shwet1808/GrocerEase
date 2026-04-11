require('dotenv').config();
const db = require('./config/db');

async function alterTable() {
    try {
        await db.query("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'completed', 'cancelled', 'returned') DEFAULT 'pending';");
        console.log("Success! Status column altered.");
        process.exit(0);
    } catch(err) {
        console.error("Error altering table", err);
        process.exit(1);
    }
}
alterTable();
