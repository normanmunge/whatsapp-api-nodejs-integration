const axios = require('axios');
require('dotenv').config;

const { User, getMemberDetails } = require('./firebase/User');

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

const getWekezaWelcomeMessage = (recipient, text) => {
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

const replyMessage = async (user_reply_initiated, user_reply_phone_number) => {
  console.log('THE USER REPLY INITIATED', user_reply_initiated);

  if (
    user_reply_initiated
    //&&
    // typeof value['statuses'] !== 'undefined' &&
    // value.statuses.length &&
    // value.statuses[0].status === 'read'
  ) {
    console.log('HERE SEND A REPLY NOW?', user_reply_phone_number);
    //ToDO :: Query our database to find the user details based on their phone number and send a breakdown of their details
    // 1. The number of chamas they belong to
    // 2. The total amount of contributions
    // 3. Their individual contribution
    // 4. The amount contribution for the month
    // 5. Next recipient in the list with the deadline date.

    const details = await getMemberDetails(user_reply_phone_number);

    if (details) {
      const { member, chama, total_chama_contributions } = details;
      const { name } = member;

      const date = new Date();
      const months_of_the_year = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      // const chama_cycle_next_month =
      //   date.getMonth() > 12
      //     ? months_of_the_year[date.getMonth() + 1]
      //     : months_of_the_year[0];
      const chama_cycle_next_month = months_of_the_year[date.getMonth() + 1];

      console.log(
        'THE CHAMA CYCLE MONTH:',
        chama_cycle_next_month,
        'details about chama',
        chama
      );

      const current_year = date.getFullYear();

      const { contribution_amount, deadline_date } = chama;

      const date_suffix =
        (deadline_date >= 4 && deadline_date <= 20) ||
        (deadline_date >= 24 && deadline_date <= 30)
          ? 'th'
          : ['st', 'nd', 'rd'][(deadline_date % 10) - 1];

      const contribution_reply = `Hey ${name} below is a breakdown of your chama: \n\n *_${chama.name}_* \n\n The total chama contribution is \n KES ${total_chama_contributions} \n Your individual total contribution is \n KES 30000 \n October Contribution \n KES ${contribution_amount} \n\n ----------------------- \n\n Next cycle recipient of your chama is James Muriithi (0726333555). \n Contributions should be sent by ${deadline_date}${date_suffix} of ${chama_cycle_next_month} ${current_year}. \n\n`;

      const wekeza_reply = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: user_reply_phone_number,
        type: 'text',
        text: {
          preview_url: false,
          body: contribution_reply,
        },
      };

      console.log('THE WEKEZA REPLY:', wekeza_reply);
      if (wekeza_reply) {
        sendMessage(wekeza_reply)
          .then((response) => {
            console.log('THE WEKEZA WEBHOOK REPLY', response);
            response.end();
          })
          .catch((err) => {
            console.log('THE ERROR:', err);
          });
      }
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
  getWekezaWelcomeMessage: getWekezaWelcomeMessage,
  getMessageId: getMessageId,
  replyMessage: replyMessage,
  message_ids,
};
