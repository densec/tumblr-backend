const express = require("express");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
require("dotenv").config();

//Connection db
require("./versions/v1/helpers/init.mongodb");

// config
const app = express();

// middleware
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// OK route.
app.get("/", (_req, res) => {
  res.send("OK");
});

const v1 = require("./versions/v1/routes");
app.use("/api/v1", v1);

// 404 route.
app.use("*", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// error handler
const errorHandler = require("./versions/v1/error/handleError");
app.use(errorHandler);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

require("./versions/v1/helpers/socketio").init(server);
