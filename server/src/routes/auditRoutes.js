const express = require("express");
const { db } = require("../config/firebase");

const router = express.Router();

// GET /api/audit?limit=100&search=approved
router.get("/", async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 250)
      : 100;

    // Read recent records; sort in memory so older records with missing
    // timestamps do not require a Firestore composite index.
    const snapshot = await db
      .collection("auditLogs")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    let events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const search = String(req.query.search || "").trim().toLowerCase();
    if (search) {
      events = events.filter((event) =>
        [
          event.action,
          event.entityType,
          event.entityId,
          event.description,
          event.actor,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search)
      );
    }

    return res.json({ success: true, events });
  } catch (error) {
    console.error("Audit log fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load audit trail",
    });
  }
});

module.exports = router;
