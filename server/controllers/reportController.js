const { Report, Users } = require("../models");
const { uploadPDFToS3, deleteFromS3 } = require("../utils/s3Upload");

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.uploadReport = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    const pdfBuffer = req.file.buffer;

    const fileKey = await uploadPDFToS3(pdfBuffer, userId);

    await Report.create({ userId, file_key: fileKey });

    const allReports = await Report.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    if (allReports.length > 5) {
      const extra = allReports.slice(5);
      for (const rep of extra) {
        await deleteFromS3(rep.file_key);
        await rep.destroy();
      }
    }

    res.json({ message: "PDF uploaded successfully", fileKey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

exports.listReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const reports = await Report.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    res.json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list reports" });
  }
};

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

exports.downloadReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await Report.findByPk(reportId);

    if (!report) return res.status(404).json({ error: "Report not found" });
    if (report.userId !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: report.file_key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return res.json({ downloadUrl: signedUrl });
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
};
