const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const userAuthRoutes = require("./routers/userAuthRoutes");
const sequelize = require("./config/db");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, "View", "pages")));

// ✅ API routes
app.use("/api", userAuthRoutes);

// ✅ Database and server start
sequelize
  .sync()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log("Database synced successfully");
  })
  .catch((err) => console.error("Sync failed:", err));
