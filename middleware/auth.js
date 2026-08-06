const jwt = require('jsonwebtoken');

// This function runs BEFORE a protected route's handler.
// It checks the token sent by the frontend and blocks the request if invalid.
function verifyToken(req, res, next) {
  // The frontend sends the token like this: "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // extract token after "Bearer "

  if (!token) {
    return res.status(401).json({ message: 'No token provided, access denied' });
  }

  try {
    // Verify checks the token's signature AND that it hasn't expired.
    // If valid, it returns the data we stored in it (id, role).
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to the request for later use
    next(); // move on to the actual route handler
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Extra layer: only allow admins through (used for product management routes)
function verifyAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

module.exports = { verifyToken, verifyAdmin };
