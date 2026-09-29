import { verifyToken } from '../utils/jwt.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);

  if (!user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = user;
  next();
}

/**
 * Requires the signed-in user's token to carry every named permission.
 *
 * The permission list is baked into the JWT at login and refreshed by /me, so a
 * permission change for an already-signed-in user takes effect on their next
 * login or /me call rather than instantly. That trade-off is what keeps the
 * middleware a single token check instead of a database query per request.
 */
export function requirePermission(...required) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const granted = req.user.permissions || [];
    const missing = required.filter((permission) => !granted.includes(permission));
    if (missing.length > 0) {
      const grantedStr = granted.length > 0 ? granted.join(', ') : 'none';
      res.status(403).json({
        error: `Insufficient permissions — requires ${required.join(', ')} (you have ${grantedStr})`,
      });
      return;
    }

    next();
  };
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}