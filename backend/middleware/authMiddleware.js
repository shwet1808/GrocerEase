const jwt = require('jsonwebtoken');

// ==========================================
// Authentication Middleware
// ==========================================
// A middleware is a function that has access to the req, res, and the "next" function.
// It sits between the user's request and our routes, acting as a guard.
// If the user passes our checks, we call `next()` to let them through.
// If they fail, we send back a 401 Unauthorized or 403 Forbidden.

exports.protect = (req, res, next) => {
  try {
    // 1. Check if the token exists in the headers
    // Usually, the frontend sends a header like: "Authorization: Bearer <token>"
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Split the string "Bearer jksdfhi34..." by space and grab the second part
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // User is trying to access a secure route without logging in
      return res.status(401).json({ message: "Not authorized, no token attached." });
    }

    // 2. Verify the Token
    // We check if the token was created using our JWT_SECRET and hasn't expired.
    // If it's valid, `jwt.verify` decrypts it, returning our original payload ({ userId, role }).
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user info to the request object
    // By attaching the user ID to `req.user`, any future route handler (like createOrder) 
    // instantly knows exactly which user made the request, without them having to tell us!
    req.user = decoded;
    
    // Everything looks good! Continue to the next piece of code.
    next();

  } catch (error) {
    // If jwt.verify fails (e.g., token expired, or someone messed with it), it throws an error
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Not authorized, token failed." });
  }
};


// ==========================================
// Admin Middleware
// ==========================================
// We use this AFTER the protect middleware.
// It guarantees the user is specifically an admin before they can do things like edit products.

exports.adminCheck = (req, res, next) => {
  // We can rely on req.user existing here, because `protect` already verified them.
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    // 403 Forbidden: You are logged in, but you don't have permission for this specific action.
    res.status(403).json({ message: "Not authorized as an admin." });
  }
};
