const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
require('dotenv').config()
const errorMiddleware = require("./middleware/error");
const connectDatabase = require("./config/database.js")

const userRoutes = require("./routes/userRoutes");

app.use(morgan("combined"));

// Was getting - (Entity too large) error while uploading heavy images from Frontend. Below 2 lines are the fix for that. Sequence of lines matter, so in future keep the sequence same if needed.
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.json());
app.use(cors());

const server = app.listen(process.env.PORT, ()=>{
  console.log(`Server is running on PORT ${process.env.PORT}`)
})
connectDatabase()

// Handling Uncaught Exception
process.on("uncaughtException", err => {
  console.log(`Shutting down the server due to uncaughtException`)

  process.exit(1)
})

// Unhandled Promise Rejection
process.on("unhandledRejection", err => {
  console.log('Error - ', err.message)
  console.log(`Shutting down the server due to unhandledRejection`)

  server.close(() => {
    process.exit(1)
  })
})

app.get("/ping", (req, res) => {
  res.status(200).json({
    message:"Server is running."
  })
})

app.use("/api/v1", userRoutes);

// middleware for errors
app.use(errorMiddleware);

module.exports = app;