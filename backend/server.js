require("dotenv").config();
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { router: destinationRoutes } = require("./routes/destinations");
const { router: bookingRoutes } = require("./routes/bookings");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false })); // CSP is disabled for the optional Google Fonts stylesheet; all app scripts are local.
app.use(express.json({ limit: "20kb" }));
app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: "draft-7", legacyHeaders: false }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "travel-tourism-api" }));
app.use("/api/destinations", destinationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use((req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "API endpoint not found." });
  return res.status(404).sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});
app.use((err, _req, res, _next) => {
  console.error("Request error:", err.message);
  if (res.headersSent) return;
  res.status(err.status || 500).json({ error: err.status && err.status < 500 ? err.message : "An unexpected server error occurred." });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Travel Tourism is running at http://localhost:${PORT}`));
}
module.exports = app;
