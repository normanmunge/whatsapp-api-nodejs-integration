const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
require('dotenv').config();

const { sendMessage, getTextMessage } = require('../messages');

router.use(body_parser.json());

router.post('/', (req, res, next) => {
  const received_message = app.get('received_message');
  console.log('THE RECEIVED MESSAGE', received_message);

  const data = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: received_message[0].id,
  };

  console.log('THE DATA TO BE SENT AS READ', data);

  res.sendStatus(200);
  //   sendMessage(data)
  //     .then((response) => {
  //       console.log('THE RESPONSE', response);
  //       res.sendStatus(200);
  //       return;
  //     })
  //     .catch((err) => {
  //       console.log('THE ERROR:', err);
  //       res.sendStatus(500);
  //       return;
  //     });
});

module.exports = router;
