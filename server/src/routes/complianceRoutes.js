
const express = require("express");
const { db } = require("../config/firebase");
const { checkCompliance } = require("../services/complianceService");
const { analyzeWithGemini } = require("../services/geminiService");

const router = express.Router();

const AI_TIMEOUT_MS = 15000;

function analyzeWithTimeout(brand, content, findings) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Gemini analysis timed out"));
    }, AI_TIMEOUT_MS);

    analyzeWithGemini(brand, content, findings)
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
}

// POST /api/compliance/check
router.post("/check", async (req, res) => {
  try {
    const { brandId, content } = req.body;

    if (typeof brandId !== "string" || !brandId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Brand ID is required",
      });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const brandDoc = await db.collection("brands").doc(brandId).get();

    if (!brandDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    const brand = {
      id: brandDoc.id,
      ...brandDoc.data(),
    };

    // Run the fast, rule-based compliance check first.
    const report = checkCompliance(brand, content);

    // AI is optional: a timeout must not block the basic report.
    try {
      report.aiAnalysis = await analyzeWithTimeout(
        brand,
        content,
        report.findings
      );
    } catch (aiError) {
      console.error("Gemini analysis unavailable:", aiError.message);

      report.aiAnalysis = null;
      report.aiWarning =
        "AI analysis timed out or was unavailable. Rule-based results are shown.";
    }

    return res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Compliance check error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to check content compliance",
    });
  }
});

module.exports = router;
