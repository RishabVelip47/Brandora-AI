
const express = require("express");

const {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} = require("../services/brandService");

const router = express.Router();

// GET /api/brands
router.get("/", async (req, res) => {
  try {
    const brands = await getAllBrands();
    res.json(brands);
  } catch (error) {
    console.error("Get brands error:", error.message);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});

// GET /api/brands/:id
router.get("/:id", async (req, res) => {
  try {
    const brand = await getBrandById(req.params.id);

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    res.json(brand);
  } catch (error) {
    console.error("Get brand error:", error.message);
    res.status(500).json({ error: "Failed to fetch brand" });
  }
});

// POST /api/brands
router.post("/", async (req, res) => {
  try {
    const brand = await createBrand(req.body);
    res.status(201).json({
      message: "Brand created successfully",
      brand,
    });
  } catch (error) {
    console.error("Create brand error:", error.message);
    res.status(500).json({ error: "Failed to create brand" });
  }
});

// PUT /api/brands/:id
router.put("/:id", async (req, res) => {
  try {
    const brand = await updateBrand(req.params.id, req.body);

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    res.json({ message: "Brand updated successfully", brand });
  } catch (error) {
    console.error("Update brand error:", error.message);
    res.status(500).json({ error: "Failed to update brand" });
  }
});

// DELETE /api/brands/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deleteBrand(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Brand not found" });
    }

    res.json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Delete brand error:", error.message);
    res.status(500).json({ error: "Failed to delete brand" });
  }
});

module.exports = router;
