require('dotenv').config();
const express = require('express');
const body_parser = require('body-parser');
const cors = require('cors');
const app = express().use(body_parser.json());
const createError = require('http-errors');
// const fs = require('fs');
// const https = require('https');
// const path = require('path');

const port = process.env.PORT || 3000;
const verify_token = process.env.VERIFY_TOKEN;
app.use(cors());

//firebase
const { User, getMemberDetails } = require('./firebase/User');
const { Joinlist } = require('./firebase/JoinList');

//routes
const welcomeRouter = require('./routes/welcome');
// const responseRouter = require('./routes/responses');
const mpesaRouter = require('./mpesa/index');
const bankwaveRouter = require('./mpesa/onetap');

//messages
const {
  getMessageId,
  sendMessage,
  replyMessage,
  getWekezaWelcomeMessage,
  message_types,
} = require('./messages');

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
// app.use('/mpesa', mpesaRouter);

//bankwave
app.use('/bankwave', bankwaveRouter);

//WHATSAPP API ENDPOINTS
app.use('/welcome', welcomeRouter);

// app.post('/responses', async (req, res) => {
//   let body = req.body;
//   console.log('THE INCOMING BODY MESSAGE', body);

//   if (req.query.token !== verify_token) {
//     return res.sendStatus(401); //unauthorized
//   }

//   res.sendStatus(201);
//   console.log('THE REQUEST NOW', req.body);
//   return;
// });

//Configure our webhook
app.get('/webhooks', async (req, res) => {
  try {
    if (
      req.query['hub.mode'] == 'subscribe' &&
      req.query['hub.verify_token'] == verify_token
    ) {
      res.send(req.query['hub.challenge']);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.log('ERROR', err);
    res.sendStatus(400);
  }
});

let cache_message_ids = [];

app.post('/webhooks', async (req, res) => {
  try {
    //resource: https://business.whatsapp.com/blog/how-to-use-webhooks-from-whatsapp-business-api

    if (req.body.object !== 'whatsapp_business_account') {
      // not from the whatsapp business webhook so dont process
      return res.sendStatus(400);
    }

    const user_reply = req.body.entry[0];
    console.log('THE WEBHOOK reply:', user_reply);

    if (user_reply) {
      //webhook
      const { id, changes } = user_reply;
      // console.log('THE WEBHOOK ID:', id);

      // if (!cache_message_ids.length || webhook_id !== cache_message_ids[0]) {
      //business details

      //const display_phone_number = value.metadata.display_phone_number;
      //const phone_number_id = value.metadata.phone_number_id;

      // console.log(
      //   'THE BUSINESS DETAILS: DISPLAY PHONE NUMBER',
      //   display_phone_number,
      //   '& PHONE ID',
      //   phone_number_id
      // );
      //console.log('THE PHONE NUMBER', value);
      const { value } = changes[0];
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

        //TODO: Store the client details to our database.

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

        //TODO: Store the user message details to our logs, utilize getMessageId function ie phone, name, message_time, message_type, message_id, message_text
        //After storing the logo, mark message as read

        getMessageId(message_id, user_reply_phone_number, 'individual');

        /**
         * Marks the message as received and read with the blue ticks check on Whatsapp.
         */
        const data = {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: message_id,
        };

        if (data) {
          await sendMessage(data)
            .then((response) => {
              if (response.data?.success) {
                user_reply_initiated = true;
              }
            })
            .catch((err) => {
              console.log('THE ERROR:', err);
              res.end();
            });
        }
      }

      if (user_reply_initiated && typeof value['messages'] !== 'undefined') {
        const message = await value.messages[0];
        const message_type = message.type;
        const message_from = message.from; //user phone number;

        //TODO: Store the logs for the customer journey i.e their most frequently selected option.
        // console.log('THE MESSAGE IS:', message.button.payload);
        if (typeof message === 'object') {
          console.log('mss', message);
          //if the message id is different, then it's a new request
          if (cache_message_ids[0] !== message.id) {
            switch (message_type) {
              case 'button':
                const message_button_payload = await message.button.payload;
                switch (message_button_payload) {
                  case 'Your Chama Profile':
                    const profile = await replyMessage(
                      message_types['chama_profile'],
                      user_reply_initiated,
                      message_from
                    );

                    console.log('THE PROFILE RESPONSE RETURNED:', profile);

                    break;
                  case 'Send Contribution':
                    /**
                     * Check next recipient
                     * Send Confirm phone number of next recipient
                     * If send, prompt STK push
                     * If no, give options and let user choose
                     */
                    await replyMessage(
                      message_types['send_contrib'],
                      user_reply_initiated,
                      message_from
                    );
                    break;
                  case 'Stop promotions':
                    console.log('STOP THE PROMOTIONS MESSAGES');
                    break;
                  case 'Confirm':
                    await replyMessage(
                      message_types['send_confirm_contrib'],
                      user_reply_initiated,
                      message_from
                    );
                    break;
                  default:
                    break;
                }
                break;
              case 'text':
                const checkIfUserRegistered = await getMemberDetails(
                  message_from
                );

                console.log('HERE?', message_from);

                //User isn't registered in our chama.
                if (!checkIfUserRegistered) {
                  console.log('User not registered');
                  await replyMessage(
                    message_types['register'],
                    user_reply_initiated,
                    message_from
                  );
                  cache_message_ids.unshift(message.id);

                  return res.end();
                }
                const data = getWekezaWelcomeMessage(
                  user_reply_phone_number,
                  'Welcome to Wekeza!'
                );
                //todo:// make send welcome message re-usable
                await sendMessage(data)
                  .then((response) => {
                    const { contacts, messages } = response.data;
                    const user_reply_phone_number = contacts[0].wa_id;
                    const message_id = messages[0].id;

                    req.user_phone = user_reply_phone_number;

                    getMessageId(
                      message_id,
                      user_reply_phone_number,
                      'business'
                    );
                    res.sendStatus(201);
                    return;
                  })
                  .catch((err) => {
                    console.log('THE ERROR', err.response['data']);
                    return res.sendStatus(400);
                  });

              //TODO: Store message detail logs:
              /**
             * {
              from: '254712658102',
              id: 'wamid.HBgMMjU0NzEyNjU4MTAyFQIAEhgUM0E3QjlDQzRGMTlCQ0I5MEVDNzgA',
              timestamp: '1697425297',
              text: { body: 'send' },
              type: 'text'
            }
             */
              // const msg = await message.text.body;
              // if (msg.toLowerCase() === 'send') {
              //   await replyMessage(
              //     message_types['send_confirm_contrib'],
              //     user_reply_initiated,
              //     message_from
              //   );
              // }

              // if (msg === 'Send Contribution') {
              //   const endpoint = app;
              //   await replyMessage(
              //     message_types['send_contrib'],
              //     user_reply_initiated,
              //     message_from
              //   );
              // }
              default:
                break;
            }
            //let's cache this webhook
            cache_message_ids.unshift(message.id);
          }
        }
      }
      // }
    }
    return res.end();
  } catch (error) {
    console.log('THE ERROR IN WEBHOOK REPLY', error);
    return res.sendStatus(400).end();
  }
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

app.post('join-wekeza-list', async (req, res) => {
  const data = req.body;
  const { name, email, phone } = req.body;
  try {
    const registrationRef = Joinlist.doc();
    await registrationRef.set({
      name: name,
      email: email,
      phone: phone,
    });
    res.status(201).json({
      data: `Happy to have you onboard! Our support team will reach out to you in the next few days.`,
    });
  } catch (error) {}
});

app.get('/chama-members', async (req, res) => {
  const data = req.body;
  res.send(getMemberDetails(data.phone));
});

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
