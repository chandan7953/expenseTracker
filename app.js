const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const userAuthRoutes = require("./routers/userAuthRoutes");
const expenseRoutes = require("./routers/expenseRoutes");
const paymentRoutes = require("./routers/paymentRoutes");
const aiCategoryRoutes = require("./routers/aiCategoryRoutes");
const forgotPasswordRoutes = require("./routers/forgotPasswordRoutes");
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

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

app.use("/api", userAuthRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", aiCategoryRoutes);
app.use("/api", forgotPasswordRoutes);
sequelize
  .sync()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log("Database synced successfully");
  })
  .catch((err) => console.error("Sync failed:", err));
