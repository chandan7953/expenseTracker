const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userAuthRoutes = require("./routers/userAuthRoutes");

const { sequelize } = require("./models");
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

app.use("/api/", userAuthRoutes);

// Sync Database
sequelize
  .sync()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log("Database synced successfully");
  })
  .catch((err) => console.error("Sync failed:", err));
