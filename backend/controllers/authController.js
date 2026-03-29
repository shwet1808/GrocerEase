const db = require('../config/db');
const bcrypt = require('bcryptjs'); // A library to securely hash passwords
const jwt = require('jsonwebtoken'); // A library to generate authentication tokens

// ==========================================
// SIGNUP CONTROLLER
// POST /api/auth/signup
// ==========================================
exports.signup = async (req, res) => {
  try {
    // 1. Extract data from the incoming request body
    const { name, email, password, role } = req.body;

    // 2. Input Validation (Basic)
    if (!name || !email || !password) {
      // 400 Bad Request indicates the user didn't send what we needed
      return res.status(400).json({ message: "Please provide name, email, and password." });
    }

    // 3. Check if user already exists
    // We use a prepared statement (?) to prevent SQL Injection attacks
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    // 4. Secure Password Hashing
    // We generate a "salt" (random data) to make the hash unique, even if two users have the same password.
    // Cost factor = 10 (higher is more secure but slower to compute)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Determine the role (default to 'customer' if not provided)
    // In a real app, you wouldn't let just anyone send {role: 'admin'} in a signup body!
    const userRole = role === 'admin' ? 'admin' : 'customer';

    // 6. Insert into database
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );

    // 7. Send a successful response
    // 201 Created
    res.status(201).json({ 
      message: "User registered successfully!", 
      userId: result.insertId 
    });

  } catch (error) {
    console.error("Signup error:", error);
    // 500 Internal Server Error means something broke on our backend code/database
    res.status(500).json({ message: "Server error during registration." });
  }
};


// ==========================================
// LOGIN CONTROLLER
// POST /api/auth/login
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Input Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    // 2. Check if user exists in the database
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // We use 401 Unauthorized for bad credentials
      // Notice we don't say "Email doesn't exist" - keeping it vague protects against hackers guessing emails.
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = users[0]; // Get the actual user object

    // 3. Verify the password
    // bcrypt.compare hashes the incoming password and checks if it matches the hash in the DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 4. Generate a JWT Token (JSON Web Token)
    // This token acts like a temporary ID card.
    // We pack (sign) the user's ID and role inside the token. 
    // They will send this token back to us on future requests (like placing an order) to prove who they are.
    const token = jwt.sign(
      { userId: user.id, role: user.role }, // Payload (data we want to store)
      process.env.JWT_SECRET,               // The secret key from our .env file that ensures it can't be forged
      { expiresIn: '1d' }                   // Token expires in 1 day
    );

    // 5. Send successful response with the token
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};
