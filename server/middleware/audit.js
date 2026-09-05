const SENSITIVE_KEYS = ['password', 'otp', 'refreshtoken', 'accesstoken', 'token', 'secret'];

const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  const clean = Array.isArray(body) ? [...body] : { ...body };
  for (const key of Object.keys(clean)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) clean[key] = '[REDACTED]';
    else if (clean[key] && typeof clean[key] === 'object') clean[key] = sanitizeBody(clean[key]);
  }
  return clean;
};

const auditLogger = (req, res, next) => {
  if (req.method === 'GET') return next();

  const originalJson = res.json;
  res.json = function (data) {
    if (req.userId && req.auditAction) {
      // Lazy require to avoid circular dependency issues at startup
      const AuditLog = require('../models/AuditLog');
      AuditLog.create({
        userId: req.userId,
        action: req.auditAction,
        entityType: req.auditEntity || req.baseUrl.split('/').pop(),
        entityId: req.params.id || undefined,
        changes: { body: sanitizeBody(req.body) },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: data && data.success ? 'success' : 'failure',
      }).catch((err) => console.error('Audit log failed:', err.message));
    }
    return originalJson.call(this, data);
  };

  next();
};

module.exports = { auditLogger };
