const express = require("express");
const { suggestCategory } = require("../controllers/aiCategoryController");

const router = express.Router();

// POST /api/suggest-category
router.post("/suggest-category", suggestCategory);

module.exports = router;
