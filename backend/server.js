const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Backend is Live 🚀");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin/auth", require("./routes/admin/authRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/upload", adminMiddleware, require("./routes/uploadRoutes"));
app.use("/api/admin/users", adminMiddleware, require("./routes/userRoutes"));


app.listen(PORT, () =>
  console.log(`Server running on ${PORT}`)
);