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

//messages
const { getMessageId, sendMessage, replyMessage } = require('./messages');

app.get('/test', (req, res) => {
  console.log('THE PROCESS ENV', process.env.RECIPIENT_WAID);
  res.sendStatus(200);
  return;
});

app.get('/', (req, res) => {
  res.send('Welcome to Wekeza');
  return;
});

//mpesa
app.post('/mpesa', async (req, res) => {
  console.log('HERE');
  res.sendStatus(200);
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
let cache_webhook_ids = [];

try {
  //let received_message;

  app.post('/webhooks', async (req, res) => {
    const user_reply = req.body.entry[0];

    console.log('THE WEBHOOK reply:', user_reply);

    if (user_reply) {
      //webhook
      const { id, changes } = user_reply;
      cache_webhook_ids.unshift(id);

      const webhook_id = id;

      // console.log('THE WEBHOOK ID:', webhook_id);

      // if (!cache_webhook_ids.length || webhook_id !== cache_webhook_ids[0]) {
      //business details
      const { value } = changes[0];

      const display_phone_number = value.metadata.display_phone_number;
      const phone_number_id = value.metadata.phone_number_id;

      // console.log(
      //   'THE BUSINESS DETAILS: DISPLAY PHONE NUMBER',
      //   display_phone_number,
      //   '& PHONE ID',
      //   phone_number_id
      // );
      //console.log('THE PHONE NUMBER', value);

      let user_reply_initiated = false;

      if (typeof value['contacts'] !== 'undefined' && value.contacts.length) {
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
        const { timestamp, type, text, button } = value.messages[0];
        const message_time = timestamp;
        const message_type = type;
        const message_id = value.messages[0].id;

        let message_text = '';
        switch (message_type) {
          case 'text':
            message_text = text.body;
            break;
          case 'button':
            message_text = button.text;
          default:
            break;
        }

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

        getMessageId(message_id, user_reply_phone_number, 'individual');

        const data = {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: message_id,
        };

        console.log('THE DATA TO BE SENT AS READ', data);
        if (data) {
          await sendMessage(data)
            .then((response) => {
              console.log('THE RESPONSE WEBHOOK REPLY', response.data);
              //res.end();
            })
            .then(() => {
              user_reply_initiated = true;
              // replyMessage(user_reply_initiated);
            })
            .catch((err) => {
              console.log('THE ERROR:', err);
              res.end();
            });
        }
      }

      if (user_reply_initiated && typeof value['messages'] !== 'undefined') {
        const message = value.messages[0];
        const message_type = message.type;
        const message_from = message.from; //user phone number;

        switch (message_type) {
          case 'button':
            if (message.button.payload === 'Your Chama Profile') {
              await replyMessage(user_reply_initiated, message_from);
            } else if (message.button.payload === 'Send Contribution') {
              console.log('HANDLE SEND CONTRIBUTION LOGIC');
            }
            break;

          default:
            break;
        }
      }

      return res.sendStatus(200);
      // }
    } else {
      return res.sendStatus(500);
    }
  });
} catch (error) {
  console.log('THE ERROR', error);
  return res.sendStatus(500);
}

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
