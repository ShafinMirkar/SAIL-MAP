require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const requestRoutes = require("./routes/requestRoutes");
const forecastRoutes = require("./routes/forecastRoutes");
const vesselRoutes = require("./routes/vesselRoutes");
const portRoutes = require("./routes/portRoutes");
const scenarioRoutes = require("./routes/scenarioRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "freight-forecasting-backend" }));

app.use("/api/requests", requestRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/vessels", vesselRoutes);
app.use("/api/ports", portRoutes);
app.use("/api/scenario", scenarioRoutes);
app.use("/api/reports", reportRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`[server] Listening on port ${PORT}`));
});
