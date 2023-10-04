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

const message_ids = [];
const getMessageId = (messageId, recipient, message) => {
  message_ids.unshift({
    id: messageId,
    phone: recipient,
    text: message,
  });

  return message_ids;
};

module.exports = {
  sendMessage: sendMessage,
  getTextMessage: getTextMessage,
  getMessageId: getMessageId,
  message_ids,
};
