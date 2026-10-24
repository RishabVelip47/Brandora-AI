
const { logAuditEvent } = require('../services/auditLogger')
const express = require('express')
const crypto = require('crypto')
const { db } = require('../config/firebase')

const router = express.Router()
const approvals = db.collection('approvals')

// Audit logging must not break successful approval operations.
async function safelyLogAuditEvent(event) {
  try {
    await logAuditEvent(event)
  } catch (auditError) {
    console.error('Audit logging error:', auditError.message)
  }
}

// Get all approval submissions
router.get('/', async (req, res) => {
  try {
    const snapshot = await approvals
      .orderBy('createdAt', 'desc')
      .get()

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    res.json({
      success: true,
      approvals: items,
    })
  } catch (error) {
    console.error('Get approvals error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approvals',
    })
  }
})

// Submit content for approval
router.post('/', async (req, res) => {
  try {
    const { brandId, content, title, report } = req.body

    if (typeof brandId !== 'string' || !brandId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Brand ID is required',
      })
    }

    if (typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      })
    }

    const brandDoc = await db
      .collection('brands')
      .doc(brandId)
      .get()

    if (!brandDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      })
    }

    const now = new Date().toISOString()
    const id = crypto.randomUUID()
    const brandName = brandDoc.data().name || 'Unknown brand'

    const approval = {
      title:
        typeof title === 'string' && title.trim()
          ? title.trim()
          : 'Untitled submission',
      brandId,
      brandName,
      content: content.trim(),
      status: 'Pending Review',
      reviewerComment: '',
      score:
        typeof report?.score === 'number'
          ? report.score
          : null,
      createdAt: now,
      updatedAt: now,
      decisionAt: null,
    }

    await approvals.doc(id).set(approval)

    await safelyLogAuditEvent({
      action: 'submission.created',
      entityType: 'approval',
      entityId: id,
      description: `Submission "${approval.title}" was created for ${brandName}.`,
      actor: 'System / unauthenticated session',
      details: {
        brandId,
        brandName,
        status: approval.status,
        score: approval.score,
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Content submitted for approval',
      approval: {
        id,
        ...approval,
      },
    })
  } catch (error) {
    console.error('Create approval error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to submit content for approval',
    })
  }
})

// Update an approval decision
router.patch('/:id/decision', async (req, res) => {
  try {
    const { status, reviewerComment } = req.body

    const allowedStatuses = [
      'Approved',
      'Rejected',
      'Changes Requested',
    ]

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          'Status must be Approved, Rejected, or Changes Requested',
      })
    }

    const docRef = approvals.doc(req.params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Approval submission not found',
      })
    }

    const existingApproval = doc.data()

    if (existingApproval.status !== 'Pending Review') {
      return res.status(409).json({
        success: false,
        message: 'This submission has already been reviewed',
      })
    }

    const now = new Date().toISOString()

    const updates = {
      status,
      reviewerComment:
        typeof reviewerComment === 'string'
          ? reviewerComment.trim()
          : '',
      updatedAt: now,
      decisionAt: now,
    }

    await docRef.update(updates)

    await safelyLogAuditEvent({
      action: 'approval.decided',
      entityType: 'approval',
      entityId: doc.id,
      description: `Submission "${existingApproval.title || 'Untitled submission'}" changed from "${existingApproval.status}" to "${status}".`,
      actor: 'System / unauthenticated session',
      details: {
        previousStatus: existingApproval.status,
        newStatus: status,
        reviewerComment: updates.reviewerComment,
        brandId: existingApproval.brandId || null,
        brandName: existingApproval.brandName || null,
      },
    })

    return res.json({
      success: true,
      message: `Submission ${status.toLowerCase()}`,
      approval: {
        id: doc.id,
        ...existingApproval,
        ...updates,
      },
    })
  } catch (error) {
    console.error('Update approval error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to update approval decision',
    })
  }
})

module.exports = router
