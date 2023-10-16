const axios = require('axios');
require('dotenv').config;

const { User, getMemberDetails } = require('./firebase/User');
const bankwaveRouter = require('./mpesa/onetap');
const { triggerStkPush } = require('./mpesa/methods');

message_types = {
  chama_profile: 'Your Chama Profile' || 'View Chama Profile',
  send_contrib: 'Send Contribution' || 'Send Contributions',
  send_confirm_contrib: 'Yes' || 'yes' || 'YES',
  stop_promotions: 'Stop promotions',
};

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

const dateLogic = (chama) => {
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

  const chama_cycle_next_month = months_of_the_year[date.getMonth() + 1];

  const current_year = date.getFullYear();

  const { deadline_date } = chama;

  const date_suffix =
    (deadline_date >= 4 && deadline_date <= 20) ||
    (deadline_date >= 24 && deadline_date <= 30)
      ? 'th'
      : ['st', 'nd', 'rd'][(deadline_date % 10) - 1];

  return {
    chama_cycle_next_date: `${chama_cycle_next_month} ${current_year}`,
    deadline_date: `${deadline_date}${date_suffix}`,
  };
};

const setChatReply = (reply, user_reply_phone_number) => {
  const chatreply = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: user_reply_phone_number,
    type: 'text',
    text: {
      preview_url: false,
      body: reply,
    },
  };
  return chatreply;
};

const replyMessage = async (
  type,
  user_reply_initiated,
  user_reply_phone_number
) => {
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
      const {
        member,
        chama,
        total_chama_contributions,
        ind_total_chama_contributions,
        next_recipient_member,
      } = details;
      const { name } = member;

      const { contribution_amount } = chama;

      let wekeza_reply = null;

      if (type.includes('Chama Profile')) {
        //Sets up the next chama cycle date:
        const { chama_cycle_next_date, deadline_date } = await dateLogic(chama);
        const contribution_reply = `Hey ${name} below is a breakdown of your chama: \n\n *_${chama.name}_* \n\n The total chama contribution is \n KES ${total_chama_contributions} \n Your individual total contribution is \n KES ${ind_total_chama_contributions} \n October Contribution \n KES ${contribution_amount} \n\n ----------------------- \n\n Next cycle recipient of your chama is ${next_recipient_member['name']} (+${next_recipient_member['phone_number']}). \n Contributions should be sent by ${deadline_date} of ${chama_cycle_next_date}. \n\n`;
        wekeza_reply = await setChatReply(
          contribution_reply,
          user_reply_phone_number
        );
      } else if (type.includes('Contribution')) {
        const confirm_next_recipient_reply = `Type *_yes*_ if next recipient is ${next_recipient_member['name']} (+${next_recipient_member['phone_number']}).`;
        wekeza_reply = await setChatReply(
          confirm_next_recipient_reply,
          user_reply_phone_number
        );
      } else if (type === message_types?.send_confirm_contrib) {
        // const stk = await triggerStkPush(chama, user_reply_phone_number);
        const stk = await bankwaveRouter
          .post('/trigger-stk-push/', {
            chama: chama,
            phone: user_reply_phone_number,
          })
          .then((stk) => {
            if (stk) {
              console.log('THE STK', stk);
              const stk_confirmation = 'Transaction In Progress';
              wekeza_reply = setChatReply(
                stk_confirmation,
                user_reply_phone_number
              );
            }
          });
      }

      if (wekeza_reply) {
        sendMessage(wekeza_reply)
          .then((response) => {
            console.log('THE WEKEZA WEBHOOK REPLY', response);
            if (response.status === 200) {
              return response.statusText;
            }
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
  message_types,
};
