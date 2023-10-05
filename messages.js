const axios = require('axios');
require('dotenv').config;

const sendMessage = (data) => {
  const config = {
    method: 'POST',
    url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
    headers: {
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: data,
  };

  return axios(config);
};

const getTextMessage = (recipient, text) => {
  return JSON.stringify({
    messaging_product: 'whatsapp',
    // preview_url: false,
    // recipient_type: 'individual',
    to: recipient,
    // type: 'text',
    // text: {
    //   body: text,
    // },
    type: 'template',
    template: {
      name: 'welcome_to_wekeza',
      language: {
        code: 'en_GB',
        // code: 'sw',
      },
    },
  });
};

const replyMessage = (user_reply_initiated, user_reply_phone_number) => {
  console.log('THE USER REPLY INITIATED', user_reply_initiated);

  if (
    user_reply_initiated
    //&&
    // typeof value['statuses'] !== 'undefined' &&
    // value.statuses.length &&
    // value.statuses[0].status === 'read'
  ) {
    console.log('HERE SEND A REPLY NOW?');

    const reply_mockup =
      'Hey Norman, \n\n The total chama contribution \n KES 180000 \n Your chama contribution \n KES 30000 \n October Contribution \n KES 3000 \n\n ----------------------- \n\n Next cycle recipient of your chama is James Muriithi (0726333555). \n Contributions should be sent by 5th of November 2023. \n\n';

    const wekeza_reply = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: user_reply_phone_number,
      type: 'text',
      text: {
        preview_url: false,
        body: reply_mockup,
      },
    };

    console.log('THE WEKEZA REPLY:', wekeza_reply);
    if (wekeza_reply) {
      sendMessage(wekeza_reply)
        .then((response) => {
          console.log('THE WEKEZA WEBHOOK REPLY', response);
          res.end();
        })
        .catch((err) => {
          console.log('THE ERROR:', err);
          res.end();
        });
    }
  }
};

const message_ids = [];
const getMessageId = (messageId, recipient, agent, message) => {
  message_ids.unshift({
    id: messageId,
    phone: recipient,
    agent: agent,
    text: typeof message !== 'undefined' ? message : null,
  });

  return message_ids;
};

module.exports = {
  sendMessage: sendMessage,
  getTextMessage: getTextMessage,
  getMessageId: getMessageId,
  replyMessage: replyMessage,
  message_ids,
};
