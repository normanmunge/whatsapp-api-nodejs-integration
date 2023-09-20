const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
require('dotenv').config();

const { sendMessage, getTextMessage } = require('../messages');

router.use(body_parser.json());

router.post('/', (req, res, next) => {
  const data = getTextMessage(process.env.RECIPIENT_WAID, 'Welcome to Wekeza!');

  sendMessage(data)
    .then((response) => {
      console.log('THE RESPONSE', response);
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
