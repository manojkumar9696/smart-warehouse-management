const db = require('../config/db');

const AuditService = {
  /**
   * Record a system/user action in the audit logs.
   * @param {number|null} userId - The user performing the action (null if system-level or initial sign up)
   * @param {string} action - Descriptive action label (e.g., 'USER_REGISTER', 'USER_LOGIN')
   * @param {string} entityType - The category or table name of the target entity
   * @param {number} entityId - ID of the target record
   * @param {Object|null} beforeValue - Value state prior to modification
   * @param {Object|null} afterValue - Value state post modification
   * @returns {Promise<void>}
   */
  log: async (userId, action, entityType, entityId, beforeValue = null, afterValue = null) => {
    try {
      const beforeJSON = beforeValue ? JSON.stringify(beforeValue) : null;
      const afterJSON = afterValue ? JSON.stringify(afterValue) : null;

      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, before_value, after_value)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, action, entityType, entityId, beforeJSON, afterJSON]
      );
    } catch (err) {
      // We catch this here so that an audit logging failure does not disrupt the main business transaction,
      // but we log it to standard error for debugging.
      console.error('Failed to write audit log:', err);
    }
  }
};

module.exports = AuditService;
