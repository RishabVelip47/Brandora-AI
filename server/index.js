
const express = require('express')
const cors = require('cors')
const complianceRoutes = require('./src/routes/complianceRoutes')
const approvalRoutes = require('./src/routes/approvalRoutes')
const auditRoutes = require('./src/routes/auditRoutes')
const crypto = require('crypto')
require('dotenv').config()

const { db } = require('./src/config/firebase')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
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
    } = req.body

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required',
      })
    }

    const brand = {
      name: name.trim(),
      industry: industry || '',
      tone: tone || '',
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

    const updates = req.body
    const updatedData = {}

    if (typeof updates.name === 'string') {
      if (!updates.name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Brand name cannot be empty',
        })
      }

      updatedData.name = updates.name.trim()
    }

    if (typeof updates.industry === 'string') {
      updatedData.industry = updates.industry
    }

    if (typeof updates.tone === 'string') {
      updatedData.tone = updates.tone
    }

    if (Array.isArray(updates.preferredTerms)) {
      updatedData.preferredTerms = updates.preferredTerms
    }

    if (Array.isArray(updates.prohibitedPhrases)) {
      updatedData.prohibitedPhrases = updates.prohibitedPhrases
    }

    if (Array.isArray(updates.approvedClaims)) {
      updatedData.approvedClaims = updates.approvedClaims
    }

    updatedData.updatedAt = new Date().toISOString()

    await docRef.update(updatedData)

    res.json({
      success: true,
      message: 'Brand updated successfully',
      brand: {
        id: doc.id,
        ...doc.data(),
        ...updatedData,
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Brandora AI backend is running',
  })
})

app.listen(PORT, () => {
  console.log(`Brandora AI API running at http://localhost:${PORT}`)
})
