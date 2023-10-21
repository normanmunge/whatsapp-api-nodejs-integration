const ENV =
  typeof process.env.NODE_ENV !== 'undefined'
    ? `.env.${process.env.NODE_ENV}`
    : `.env`;
require('dotenv').config({ path: ENV });

const express = require('express');
const router = express.Router();

//firebase
const { User, getMemberDetails } = require('../firebase/User');
const { Joinlist } = require('../firebase/JoinList');

//routes
const welcomeRouter = require('./welcome');
// const responseRouter = require('./responses');
const mpesaRouter = require('../mpesa/index');
const bankwaveRouter = require('../mpesa/onetap');

//messages
const {
  getMessageId,
  sendMessage,
  replyMessage,
  getWekezaWelcomeMessage,
  message_types,
} = require('../messages');

const verify_token = process.env.VERIFY_TOKEN;

const { setChamaProfileText } = require('../utils/utils');

router.get('/test', (req, res) => {
  console.log('THE PROCESS ENV', process.env.RECIPIENT_WAID);
  res.sendStatus(200);
  return;
});

router.get('/', (req, res) => {
  res.send(`Welcome to Wekeza: Serving with this env: ${process.env.NODE_ENV}`);
  return;
});

//mpesa
// router.use('/mpesa', mpesaRouter);

//bankwave
router.use('/bankwave', bankwaveRouter);

//WHATSAPP API ENDPOINTS
router.use('/welcome', welcomeRouter);

// router.post('/responses', async (req, res) => {
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
router.get('/webhooks', async (req, res) => {
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

router.post('/webhooks', async (req, res) => {
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

          let chama_profile_text = setChamaProfileText();
          //if the message id is different, then it's a new request
          if (cache_message_ids[0] !== message.id) {
            switch (message_type) {
              case 'button':
                const message_button_payload = await message.button.payload;
                switch (message_button_payload) {
                  case chama_profile_text:
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
                  message_from,
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
                    return res.sendStatus(200);
                  })
                  .catch((err) => {
                    console.log('THE ERROR', err.response['data']);
                    return res.sendStatus(400);
                  });

              //TODO: Store message detail logs:
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
    return res.sendStatus(500);
  }
});

//FIREBASE ENDPOINTS
router.post('/create-user', async (req, res) => {
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

router.post('join-wekeza-list', async (req, res) => {
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

router.get('/chama-members', async (req, res) => {
  const data = req.body;
  res.send(getMemberDetails(data.phone));
});

module.exports = router;
