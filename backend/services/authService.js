// ============================================================================
// AUTH SERVICE — backend/services/authService.js
// ============================================================================
//
// WHAT IS A SERVICE?
// ------------------
// A "Service" is a layer of code that contains all the BUSINESS LOGIC for a
// specific feature. Think of it as the "brain" of your feature.
//
// WHY SEPARATE IT FROM THE CONTROLLER?
// The Controller's job is ONLY to:
//   1. Read data from the HTTP request (req.body, req.params, etc.)
//   2. Call the appropriate Service function
//   3. Send back an HTTP response (res.json)
//
// The Service's job is to:
//   1. Validate data
//   2. Talk to the database (SQL queries)
//   3. Apply business rules (hashing passwords, generating tokens, etc.)
//   4. Return the result or throw an error
//
// This separation makes the code easier to read, test, and maintain.
// If you ever need to reuse "create a user" logic elsewhere, you can simply
// call authService.createUser() without needing an HTTP request object.
// ============================================================================

const db = require('../config/db');
const bcrypt = require('bcryptjs'); // Library to securely hash (scramble) passwords
const jwt = require('jsonwebtoken'); // Library to create authentication tokens (digital ID cards)

// ============================================================================
// CREATE USER (used by the Signup endpoint)
// ============================================================================
// This function handles the entire user registration process:
//   1. Checks if the email is already taken
//   2. Hashes (securely scrambles) the password so it's never stored in plain text
//   3. Inserts the new user into the database
//   4. Returns the new user's ID
//
// Parameters:
//   - name     (string): The user's full name, e.g. "John Doe"
//   - email    (string): The user's email, e.g. "john@example.com"
//   - password (string): The user's plain-text password (we will hash it before saving)
//   - role     (string): Either "admin" or "customer" (defaults to "customer")
//
// Returns: { userId: <number> }
// Throws:  Error with statusCode 400 if email already exists
// ============================================================================
const createUser = async (name, email, password, role) => {

  // --- Step 1: Check if a user with this email already exists ---
  // We use a parameterized query (the '?' placeholder) to prevent SQL Injection attacks.
  // SQL Injection is when a hacker tries to send malicious SQL code through the input fields.
  // Using '?' ensures the database treats the input as pure data, never as executable code.
  const [existingUsers] = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUsers.length > 0) {
    // If we found a match, create an error with a 400 status code (Bad Request).
    // We attach 'statusCode' so the controller knows which HTTP status to send back.
    const error = new Error('A user with this email already exists.');
    error.statusCode = 400;
    throw error;
  }

  // --- Step 2: Hash (scramble) the password ---
  // We NEVER store plain-text passwords in the database. If our database ever gets
  // hacked, the attacker would only see scrambled gibberish, not actual passwords.
  //
  // How it works:
  //   1. genSalt(10) creates random data called a "salt" (think of it as adding
  //      a random ingredient to a recipe so the same password produces different hashes)
  //   2. hash() combines the password + salt and runs it through a one-way mathematical
  //      function. "One-way" means you can go from password → hash, but NEVER hash → password.
  //   3. The number 10 is the "cost factor" — higher = more secure but slower to compute
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // --- Step 3: Determine the user's role ---
  // Default to 'customer' if no role is provided, or if someone tries to send
  // an invalid role. In a production app, you'd have stricter role assignment
  // (e.g., only existing admins can create new admins).
  const userRole = role === 'admin' ? 'admin' : 'customer';

  // --- Step 4: Insert the new user into the database ---
  const [result] = await db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, userRole]
  );

  // --- Step 5: Return the newly created user's ID ---
  // result.insertId is automatically provided by MySQL after a successful INSERT
  return { userId: result.insertId };
};


// ============================================================================
// AUTHENTICATE USER (used by the Login endpoint)
// ============================================================================
// This function handles the entire login process:
//   1. Finds the user by email
//   2. Verifies their password against the stored hash
//   3. Generates a JWT token (a digital ID card)
//   4. Returns the token and user info
//
// Parameters:
//   - email    (string): The email they're trying to log in with
//   - password (string): The password they're trying to log in with
//
// Returns: { token: <string>, user: { id, name, email, role } }
// Throws:  Error with statusCode 401 if credentials are invalid
// ============================================================================
const authenticateUser = async (email, password) => {

  // --- Step 1: Look up the user by email ---
  const [users] = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    // SECURITY NOTE: We intentionally say "Invalid email or password" instead of
    // "Email not found". This prevents hackers from figuring out which emails
    // are registered in our system (called "user enumeration").
    const error = new Error('Invalid email or password.');
    error.statusCode = 401; // 401 = Unauthorized
    throw error;
  }

  const user = users[0]; // Get the first (and only) matching user

  // --- Step 2: Verify the password ---
  // bcrypt.compare() takes the plain-text password the user just typed in,
  // hashes it using the SAME salt that was used when they signed up,
  // and checks if the result matches what's stored in the database.
  // This is the beauty of bcrypt — it stores the salt inside the hash itself.
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    // Same vague message for security — don't reveal which part was wrong
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // --- Step 3: Generate a JWT Token (JSON Web Token) ---
  // Think of a JWT like a temporary, encrypted ID card:
  //   - PAYLOAD: The data we pack inside (userId and role). This tells us
  //     WHO the user is and WHAT they're allowed to do.
  //   - SECRET: A private key (from our .env file) used to "sign" the token.
  //     Without this key, no one can forge a fake token.
  //   - EXPIRY: The token automatically becomes invalid after 1 day.
  //     This limits damage if a token is ever stolen.
  const token = jwt.sign(
    { userId: user.id, role: user.role },  // Payload (data stored in the token)
    process.env.JWT_SECRET,                 // Secret key to sign/encrypt the token
    { expiresIn: '1d' }                     // Token expires in 1 day
  );

  // --- Step 4: Return the token and safe user data ---
  // IMPORTANT: We deliberately exclude the password from the response.
  // Never send password hashes to the frontend — even though they're scrambled.
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};


// ============================================================================
// EXPORTS
// ============================================================================
// We export all service functions so the controller can import and use them.
// Think of this as making these functions "available" to other files.
module.exports = {
  createUser,
  authenticateUser
};
