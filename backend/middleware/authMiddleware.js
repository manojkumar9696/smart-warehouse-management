const jwt = require('jsonwebtoken');

/**
 * Verify JWT Token Middleware
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No authentication token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    req.user = decoded; // decoded contains id, username, and role
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid, expired, or malformed authentication token.' 
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param {...string} roles - Allowed roles for this endpoint ('admin', 'manager', 'employee')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized. User authentication context is missing.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.` 
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};
