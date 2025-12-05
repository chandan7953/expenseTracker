const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userAuthRoutes = require("./routers/userAuthRoutes");
const expenseRoutes = require("./routers/expenseRoutes");
const paymentRoutes = require("./routers/paymentRoutes");
const aiCategoryRoutes = require("./routers/aiCategoryRoutes");
const forgotPasswordRoutes = require("./routers/forgotPasswordRoutes");
const reportRoutes = require("./routers/reportRoutes");
const { sequelize } = require("./models");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use("/api", userAuthRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reports", reportRoutes);
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
