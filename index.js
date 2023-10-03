require('dotenv').config();
const express = require('express');
const body_parser = require('body-parser');
const app = express().use(body_parser.json());
const createError = require('http-errors');
const fs = require('fs');
const https = require('https');
const path = require('path');

const port = process.env.PORT || 3000;

//firebase
const User = require('./firebase/User');
// const firebase = require('./firebase/config');

//routes
const welcomeRouter = require('./routes/welcome');
const responseRouter = require('./routes/responses');

app.get('/test', (req, res) => {
  console.log('THE PROCESS ENV', process.env.RECIPIENT_WAID);
  res.sendStatus(200);
  return;
});

app.use('/welcome', welcomeRouter);

const verify_token = process.env.VERIFY_TOKEN;

app.get('/', (req, res) => {
  res.send('Welcome to Wekeza');
  return;
});

app.post('/responses', async (req, res) => {
  let body = req.body;
  console.log('THE INCOMING BODY MESSAGE', body);

  if (req.query.token !== verify_token) {
    return res.sendStatus(401); //unauthorized
  }

  res.sendStatus(200);
  console.log('THE REQUEST NOW', req.body);
  return;
});

app.post('/create-user', async (req, res) => {
  const data = req.body;
  try {
    const memberRef = User.doc();
    await memberRef.set(data);
  } catch (error) {
    console.log('THE ERROR', error);
    res.send({ error: error });
    res.sendStatus(403);
    return;
  }

  res.send({ msg: 'User added' });
});

app.get('/users', async (req, res) => {
  const snapshot = await User.get();
  snapshot.forEach((doc) => {
    console.log('THE USERS ARE:', doc.data());
  });

  res.send({ msg: snapshot });
});

// app.get('/', (req, res) => {
//   console.log('WELCOME TO WEKEZA');
//   return;
// });

// catch 404 and forward to error handler
app.use((req, res, next) => {
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
