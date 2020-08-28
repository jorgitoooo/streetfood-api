const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

process.on("uncaughtException", (err) => {
  console.log(
    `🧨💥 UNHANDLED REJECTION 💥🧨\n  ${err.name}: ${err.message}\n  Shutting down...`
  );
  process.exit(1);
});

const app = require("./app");

const DB = process.env.MONGO_URI.replace("<PWD>", process.env.MONGO_PWD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Database connection successful.");
  });

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(
    `🧨💥 UNHANDLED REJECTION 💥🧨\n  ${err.name}: ${err.message}\n  Shutting down...`
  );
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("💥 SIGTERM 💥 received. Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Process terminated successfully");
  });
});
