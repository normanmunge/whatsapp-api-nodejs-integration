require("dotenv").config();
const express = require("express");
const app = express();
const createError = require("http-errors");
const port = process.env.PORT || 3000;

const welcomeRouter = require("./routes/welcome");
const responseRouter = require("./routes/responses");

app.get("/test", (req, res) => {
  console.log("THE PROCESS ENV", process.env.RECIPIENT_WAID);
  res.sendStatus(200);
  return;
});

app.use("/welcome", welcomeRouter);

const verify_token = process.env.VERIFY_TOKEN;

app.get("/responses", (req, res) => {
  if (req.query.token !== verify_token) {
    return res.sendStatus(401); //unauthorized
  }

  res.sendStatus(200);
  console.log("THE REQUEST NOW", req.body);
  return;
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

app.listen(port, () => {
  console.log("Server started");
});

module.exports = app;
