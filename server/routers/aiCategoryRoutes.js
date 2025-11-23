const express = require("express");
const { suggestCategory } = require("../controllers/aiCategoryController");

const router = express.Router();

router.post("/suggest-category", suggestCategory);

module.exports = router;
