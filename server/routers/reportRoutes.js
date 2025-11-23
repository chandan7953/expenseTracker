const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();

const {
  uploadReport,
  listReports,
  downloadReport,
} = require("../controllers/reportController");
const authenticate = require("../middlewares/authMiddleware");

router.post("/upload", upload.single("pdf"), authenticate, uploadReport);
router.get("/list", authenticate, listReports);
router.get("/download/:id", authenticate, downloadReport);

module.exports = router;
