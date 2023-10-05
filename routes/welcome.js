const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
require('dotenv').config();

const { sendMessage, getTextMessage, getMessageId } = require('../messages');

router.use(body_parser.json());

router.post('/', (req, res, next) => {
  const data = getTextMessage(process.env.RECIPIENT_WAID, 'Welcome to Wekeza!');

  sendMessage(data)
    .then((response) => {
      //console.log('THE RESPONSE', response.data);

      const { contacts, messages } = response.data;
      const user_reply_phone_number = contacts[0].wa_id;
      const message_id = messages[0].id;

      getMessageId(message_id, user_reply_phone_number, 'business');
      res.sendStatus(200);
      return;
    })
    .catch((err) => {
      console.log('THE ERROR:', err);
      res.sendStatus(500);
      return;
    });
});

module.exports = router;
