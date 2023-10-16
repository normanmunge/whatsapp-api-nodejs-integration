const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
require('dotenv').config();

const {
  sendMessage,
  getWekezaWelcomeMessage,
  getMessageId,
} = require('../messages');

router.use(body_parser.json());

router.post('/', (req, res, next) => {
  const data = getWekezaWelcomeMessage(
    process.env.RECIPIENT_WAID,
    'Welcome to Wekeza!'
  );

  sendMessage(data)
    .then((response) => {
      //console.log('THE RESPONSE', response.data);

      const { contacts, messages } = response.data;
      const user_reply_phone_number = contacts[0].wa_id;
      const message_id = messages[0].id;

      req.user_phone = user_reply_phone_number;

      getMessageId(message_id, user_reply_phone_number, 'business');
      res.sendStatus(201);
      return;
    })
    .catch((err) => {
      console.log('THE ERROR:', err.data);
      res.sendStatus(400);
      return;
    });
});

module.exports = router;
