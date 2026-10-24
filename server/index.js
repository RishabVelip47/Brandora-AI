
const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
require('dotenv').config()

const { db } = require('./src/config/firebase')

const complianceRoutes = require('./src/routes/complianceRoutes')
const approvalRoutes = require('./src/routes/approvalRoutes')
const auditRoutes = require('./src/routes/auditRoutes')

const app = express()
const PORT = process.env.PORT || 5000

// Configure CORS for local development and the deployed frontend.
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as health checks.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Origin not allowed by CORS'))
    },
  })
)

// Parse JSON requests with a reasonable size limit.
app.use(express.json({ limit: '1mb' }))

// Health checks
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Brandora AI backend is running',
  })
})

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Brandora AI backend is running',
  })
})

// Existing API routes
app.use('/api/compliance', complianceRoutes)
app.use('/api/approvals', approvalRoutes)
app.use('/api/audit', auditRoutes)

// Firestore brands collection
const brands = db.collection('brands')

// Get all brands
app.get('/api/brands', async (req, res) => {
  try {
    const snapshot = await brands.get()

    const allBrands = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    res.json({
      success: true,
      brands: allBrands,
    })
  } catch (error) {
    console.error('Get brands error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands',
    })
  }
})

// Get one brand
app.get('/api/brands/:id', async (req, res) => {
  try {
    const doc = await brands.doc(req.params.id).get()

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      })
    }

    res.json({
      success: true,
      brand: {
        id: doc.id,
        ...doc.data(),
      },
    })
  } catch (error) {
    console.error('Get brand error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand',
    })
  }
})

// Create a brand
app.post('/api/brands', async (req, res) => {
  try {
    const {
      name,
      industry,
      tone,
      preferredTerms,
      prohibitedPhrases,
      approvedClaims,
    } = req.body || {}

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required',
      })
    }

    const brand = {
      name: name.trim(),
      industry: typeof industry === 'string' ? industry : '',
      tone: typeof tone === 'string' ? tone : '',
      preferredTerms: Array.isArray(preferredTerms)
        ? preferredTerms
        : [],
      prohibitedPhrases: Array.isArray(prohibitedPhrases)
        ? prohibitedPhrases
        : [],
      approvedClaims: Array.isArray(approvedClaims)
        ? approvedClaims
        : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const id = crypto.randomUUID()

    await brands.doc(id).set(brand)

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      brand: {
        id,
        ...brand,
      },
    })
  } catch (error) {
    console.error('Create brand error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to create brand',
    })
  }
})

// Update a brand
app.put('/api/brands/:id', async (req, res) => {
  try {
    const docRef = brands.doc(req.params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      })
    }

    const updates = req.body || {}
    const updatedData = {}

    if (Object.prototype.hasOwnProperty.call(updates, 'name')) {
      if (typeof updates.name !== 'string' || !updates.name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Brand name cannot be empty',
        })
      }

      updatedData.name = updates.name.trim()
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'industry')) {
      if (typeof updates.industry !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Industry must be a string',
        })
      }

      updatedData.industry = updates.industry
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'tone')) {
      if (typeof updates.tone !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Tone must be a string',
        })
      }

      updatedData.tone = updates.tone
    }

    for (const field of [
      'preferredTerms',
      'prohibitedPhrases',
      'approvedClaims',
    ]) {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        if (!Array.isArray(updates[field])) {
          return res.status(400).json({
            success: false,
            message: `${field} must be an array`,
          })
        }

        updatedData[field] = updates[field]
      }
    }

    updatedData.updatedAt = new Date().toISOString()

    await docRef.update(updatedData)

    const updatedDoc = await docRef.get()

    res.json({
      success: true,
      message: 'Brand updated successfully',
      brand: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    })
  } catch (error) {
    console.error('Update brand error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to update brand',
    })
  }
})

// Delete a brand
app.delete('/api/brands/:id', async (req, res) => {
  try {
    const docRef = brands.doc(req.params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      })
    }

    await docRef.delete()

    res.json({
      success: true,
      message: 'Brand deleted successfully',
    })
  } catch (error) {
    console.error('Delete brand error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to delete brand',
    })
  }
})

// Handle unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  })
})

// Handle malformed JSON
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON request body',
    })
  }

  if (error.message === 'Origin not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed',
    })
  }

  console.error('Unhandled server error:', error.message)

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  })
})

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Brandora AI API running on port ${PORT}`)
})
