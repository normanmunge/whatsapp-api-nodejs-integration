require('dotenv').config();
const express = require('express');
const body_parser = require('body-parser');
const app = express().use(body_parser.json());
const createError = require('http-errors');
const fs = require('fs');
const https = require('https');
const path = require('path');

const port = process.env.PORT || 3000;
const verify_token = process.env.VERIFY_TOKEN;

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

app.get('/', (req, res) => {
  res.send('Welcome to Wekeza');
  return;
});

//WHATSAPP API ENDPOINTS

app.use('/welcome', welcomeRouter);

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

// app.get("/webhooks", async (req, res) => {
//   const data = req.body;
//   console.log("THE INCOMING BODY FROM WHATSAPP", data);

//   res.sendStatus(200);
//   return;
// });

app.post('/webhooks', async (req, res) => {
  const user_reply = req.body.entry[0];

  //webhook
  const { id, changes } = user_reply;
  const webhook_id = id;

  console.log('THE WEBHOOK ID:', webhook_id);

  //business details
  const { value } = changes[0];

  const display_phone_number = value.metadata.display_phone_number;
  const phone_number_id = value.metadata.phone_number_id;

  console.log(
    'THE BUSINESS DETAILS: DISPLAY PHONE NUMBER',
    display_phone_number,
    '& PHONE ID',
    phone_number_id
  );

  //client profile details
  const { profile, wa_id } = value.contacts[0];
  const user_reply_name = profile.name;
  const user_reply_phone_number = wa_id;

  console.log(
    'THE CLIENT PROFILE',
    user_reply_name,
    '& THE PHONE NUMBER',
    user_reply_phone_number
  );

  //client message details
  const { timestamp, type, text } = value.messages[0];
  const message_time = timestamp;
  const message_type = type;
  const message_id = value.messages[0].id;
  const message_text = text.body;

  console.log(
    'THE MESSAGE DETAILS: TIME',
    message_time,
    '& THE TYPE',
    message_type,
    '& THE MESSAGE ID',
    message_id,
    '& THE MESSAGE TEXT',
    message_text
  );

  res.sendStatus(200);
  return;
});

//FIREBASE ENDPOINTS
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
