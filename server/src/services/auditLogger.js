const { db } = require("../config/firebase");

/**
 * Writes an append-only audit event. Actor identity is a placeholder until
 * Firebase Authentication and backend token verification are added in Phase 3.
 */
async function logAuditEvent({
  action,
  entityType,
  entityId,
  description,
  actor = "System / unauthenticated session",
  details = {},
}) {
  const event = {
    action,
    entityType,
    entityId: String(entityId || ""),
    description,
    actor,
    details,
    createdAt: new Date().toISOString(),
  };

  await db.collection("auditLogs").add(event);
  return event;
}

module.exports = { logAuditEvent };
