require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");


const authRoutes = require("./routes/authroute");
const taskRoutes = require("./routes/taskroutes");
const adminRoutes = require("./routes/adminroutes");


connectDB();

const app = express();
app.use(cors());


app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));


if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}


const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: "Too many requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many auth attempts. Try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(globalLimiter);


app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);


app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running.",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found.`,
    });
});


app.use(errorHandler);


const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`\n Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health\n`);
});


process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err.message);
    server.close(() => process.exit(1));
});

module.exports = app;