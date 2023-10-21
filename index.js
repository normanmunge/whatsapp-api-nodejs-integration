const express = require('express');
const body_parser = require('body-parser');
const cors = require('cors');
const createError = require('http-errors');
const port = process.env.PORT || 3000;

const app = express().use(body_parser.json());

//ROUTES
const router = require('./routes/index');

app.use(cors());

app.use(router);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  console.log('THE REQUEST', req);
  next(createError(404));
});

//ssl
// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, './https-cert/CA/key.pem')),
//   cert: fs.readFileSync(path.join(__dirname, './https-cert/CA/cert.pem')),
// };
// const sslServer = https.createServer(sslOptions, app);
// sslServer.listen(port, () => {
//   console.log(`Secure Server started on port ${port}`);
// });

app.listen(port, () => {
  console.log(`Secure Server started on port ${port}`);
});

module.exports = app;
