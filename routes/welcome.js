const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
require('dotenv').config();

const {
  sendMessage,
  getWekezaWelcomeMessage,
  getMessageId,
} = require('../messages');

// const { getMember } = require('../firebase/User');

router.use(body_parser.json());

router.post('/', (req, res, next) => {
  //test purposes
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

      res.sendStatus(201);
      return;
    })
    .catch((err) => {
      console.log('THE ERROR', err.response['data']);
      return res
        .status(401)
        .json({ error: err.response['data'].error.message });
    });
});

module.exports = router;
