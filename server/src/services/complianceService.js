
function normalizeForMatching(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function checkCompliance(brand, content) {
  const findings = [];

  const normalizedContent = normalizeForMatching(content);

  const prohibitedPhrases = Array.isArray(brand.prohibitedPhrases)
    ? brand.prohibitedPhrases
    : [];

  const preferredTerms = Array.isArray(brand.preferredTerms)
    ? brand.preferredTerms
    : [];

  // Rule 1: Find prohibited phrases, ignoring case and punctuation.
  for (const phrase of prohibitedPhrases) {
    if (typeof phrase !== "string" || !phrase.trim()) continue;

    const normalizedPhrase = normalizeForMatching(phrase);

    if (
      normalizedPhrase &&
      ` ${normalizedContent} `.includes(` ${normalizedPhrase} `)
    ) {
      findings.push({
        type: "prohibited_phrase",
        severity: "high",
        phrase: phrase.trim(),
        message: `Content contains the prohibited phrase "${phrase.trim()}".`,
        suggestion: `Remove or replace "${phrase.trim()}".`,
      });
    }
  }

  // Rule 2: Recommend preferred terms that are missing.
  for (const term of preferredTerms) {
    if (typeof term !== "string" || !term.trim()) continue;

    const normalizedTerm = normalizeForMatching(term);

    if (
      normalizedTerm &&
      !` ${normalizedContent} `.includes(` ${normalizedTerm} `)
    ) {
      findings.push({
        type: "preferred_term_missing",
        severity: "low",
        phrase: term.trim(),
        message: `Consider using the preferred term "${term.trim()}".`,
        suggestion: `Review whether "${term.trim()}" would improve alignment with the brand voice.`,
      });
    }
  }

  // Rule 3: Flag potentially risky marketing claims for human review.
  // These phrases are not automatically considered false.
  const riskyClaimPatterns = [
    {
      phrase: "guaranteed",
      pattern: /\bguarantee(?:d|s)?\b/i,
      reason: "A guarantee may require supporting evidence or approved terms.",
    },
    {
      phrase: "100% proven",
      pattern: /\b100\s*%\s+proven\b/i,
      reason: "This absolute proof claim should be supported by reliable evidence.",
    },
    {
      phrase: "scientifically proven",
      pattern: /\bscientifically\s+proven\b/i,
      reason: "Scientific claims may need evidence or approved substantiation.",
    },
    {
      phrase: "safest",
      pattern: /\bsafest\b/i,
      reason: "A superlative safety claim may require comparative evidence.",
    },
    {
      phrase: "best",
      pattern: /\bbest\b/i,
      reason: "A broad superiority claim may need evidence or qualification.",
    },
    {
      phrase: "risk-free",
      pattern: /\brisk\s+free\b/i,
      reason: "An absolute risk claim may be misleading without qualification.",
    },
    {
      phrase: "no side effects",
      pattern: /\bno\s+side\s+effects\b/i,
      reason: "This health or safety claim needs appropriate supporting evidence.",
    },
    {
      phrase: "cure",
      pattern: /\bcure(?:s|d)?\b/i,
      reason: "A treatment or cure claim may require strong evidence and review.",
    },
    {
      phrase: "instant results",
      pattern: /\binstant\s+results\b/i,
      reason: "A promise of immediate results may require supporting evidence.",
    },
  ];

  for (const rule of riskyClaimPatterns) {
    const match = content.match(rule.pattern);

    if (match) {
      findings.push({
        type: "claim_for_review",
        severity: "medium",
        phrase: match[0],
        message: `Potentially risky marketing claim detected: "${match[0]}".`,
        suggestion: rule.reason,
      });
    }
  }

  const violations = findings.filter(
    (finding) => finding.severity === "high"
  ).length;

  const suggestions = findings.filter(
    (finding) => finding.severity === "low"
  ).length;

  // Keep the existing scoring formula unchanged.
  const score = Math.max(
    0,
    100 - violations * 25 - suggestions * 5
  );

  return {
    brandId: brand.id,
    brandName: brand.name,
    score,
    status: violations > 0 ? "needs_changes" : "rule_check_passed",
    analysisMode: "rule_based",
    findings,
    summary: {
      violations,
      suggestions,
      totalFindings: findings.length,
    },
    checkedAt: new Date().toISOString(),
    limitations: [
      "Approved claims are not automatically fact-verified in this rule-based version.",
      "Potentially risky marketing claims are flagged for human review and are not automatically determined to be false.",
      "A passing result means no configured prohibited phrase was found; it does not guarantee full brand compliance.",
      "Risky-claim detection uses predefined phrases and may miss claims expressed in other ways.",
    ],
  };
}

module.exports = { checkCompliance };
