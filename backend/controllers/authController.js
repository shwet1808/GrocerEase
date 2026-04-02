// ============================================================================
// AUTH CONTROLLER — backend/controllers/authController.js
// ============================================================================
//
// WHAT IS A CONTROLLER?
// ---------------------
// A Controller is the "traffic cop" between the HTTP world and the business logic.
// Its ONLY responsibilities are:
//   1. Extract data from the incoming HTTP request (req.body, req.params, etc.)
//   2. Call the appropriate Service function (which does the real work)
//   3. Send back an HTTP response (res.json) with the result or error
//
// A Controller should NEVER:
//   ✗ Contain SQL queries (that's the Service's job)
//   ✗ Contain business logic like password hashing (that's the Service's job)
//   ✗ Import the database module directly
//
// This separation keeps each file small, focused, and easy to understand.
// ============================================================================

const authService = require('../services/authService');

// ============================================================================
// SIGNUP CONTROLLER
// POST /api/auth/signup
// ============================================================================
// Handles new user registration requests.
//
// Expected request body:
//   { "name": "John Doe", "email": "john@example.com", "password": "secret123", "role": "customer" }
//
// Success response (201 Created):
//   { "message": "User registered successfully!", "userId": 42 }
//
// Error responses:
//   400 — missing fields or email already exists
//   500 — unexpected server error
// ============================================================================
exports.signup = async (req, res) => {
  try {
    // Step 1: Extract the data from the request body
    const { name, email, password, role } = req.body;

    // Step 2: Quick validation — check if required fields are present
    // We do this in the controller (not the service) because it's an HTTP-level concern:
    // we need to tell the client they sent a bad request (400) immediately.
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password.'
      });
    }

    // Step 3: Delegate the actual work to the auth service
    // The service handles: duplicate checking, password hashing, DB insertion
    const result = await authService.createUser(name, email, password, role);

    // Step 4: Send the success response
    // 201 = "Created" — the standard HTTP code for successful resource creation
    res.status(201).json({
      message: 'User registered successfully!',
      userId: result.userId
    });

  } catch (error) {
    // If the service threw an error with a statusCode (e.g., 400 for duplicate email),
    // use that. Otherwise, default to 500 (Internal Server Error).
    console.error('Signup error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Server error during registration.'
    });
  }
};


// ============================================================================
// LOGIN CONTROLLER
// POST /api/auth/login
// ============================================================================
// Handles user login requests. Returns a JWT token on success.
//
// Expected request body:
//   { "email": "john@example.com", "password": "secret123" }
//
// Success response (200 OK):
//   { "message": "Login successful", "token": "eyJhbG...", "user": { id, name, email, role } }
//
// Error responses:
//   400 — missing email or password
//   401 — invalid credentials
//   500 — unexpected server error
// ============================================================================
exports.login = async (req, res) => {
  try {
    // Step 1: Extract credentials from the request body
    const { email, password } = req.body;

    // Step 2: Quick validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password.'
      });
    }

    // Step 3: Delegate to the auth service
    // The service handles: user lookup, password verification, JWT generation
    const result = await authService.authenticateUser(email, password);

    // Step 4: Send the success response with the token
    res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user
    });

  } catch (error) {
    console.error('Login error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Server error during login.'
    });
  }
};
