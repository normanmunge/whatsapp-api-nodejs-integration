const axios = require('axios');
require('dotenv').config;
const express = require('express');
const router = express.Router();
const needle = require('needle');

const { User, getMemberDetails } = require('./firebase/User');
const bankwaveRouter = require('./mpesa/onetap');
const { triggerStkPush, generateAccessToken } = require('./mpesa/methods');

message_types = {
  chama_profile: 'Your Chama Profile' || 'View Chama Profile',
  send_contrib: 'Send Contribution' || 'Send Contributions',
  send_confirm_contrib: 'send',
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

const confirmRecipientMessage = (recipient, data) => {
  return JSON.stringify({
    messaging_product: 'whatsapp',
    to: recipient,
    type: 'template',
    template: {
      name: 'send_contibutions',
      language: {
        code: 'en_GB',
      },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: data['name'],
            },
            {
              type: 'text',
              text: `+${data['phone_number']}`,
            },
          ],
        },
      ],
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
  if (
    user_reply_initiated
    //&&
    // typeof value['statuses'] !== 'undefined' &&
    // value.statuses.length &&
    // value.statuses[0].status === 'read'
  ) {
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

      console.log('WHAT DOES THE TYPE INLCUDE', type);

      if (type.includes('Chama Profile')) {
        //Sets up the next chama cycle date:
        const { chama_cycle_next_date, deadline_date } = await dateLogic(chama);
        const contribution_reply = `Hey ${name} below is a breakdown of your chama: \n\n *_${chama.name}_* \n\n The total chama contribution is \n KES ${total_chama_contributions} \n Your individual total contribution is \n KES ${ind_total_chama_contributions} \n October Contribution \n KES ${contribution_amount} \n\n ----------------------- \n\n Next cycle recipient of your chama is ${next_recipient_member['name']} (+${next_recipient_member['phone_number']}). \n Contributions should be sent by ${deadline_date} of ${chama_cycle_next_date}. \n\n`;
        wekeza_reply = await setChatReply(
          contribution_reply,
          user_reply_phone_number
        );
      } else if (type.includes('Contribution')) {
        //const confirm_next_recipient_reply = `Type *_send*_ if next recipient is ${next_recipient_member['name']} (+${next_recipient_member['phone_number']}).`;

        // wekeza_reply = await setChatReply(
        //   confirm_next_recipient_reply,
        //   user_reply_phone_number
        // );
        console.log('THE NEXT RECIPIENT IS:', next_recipient_member);

        wekeza_reply = await confirmRecipientMessage(
          user_reply_phone_number,
          next_recipient_member
        );
      } else if (type === message_types?.send_confirm_contrib) {
        const BANKWAVE_API_BASE_URL = process.env.BANKWAVE_DEV_BASE_URL;

        let header_options = {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        };

        const generateAccessToken = async () => {
          try {
            const auth = {
              client_id: process.env.BANKWAVE_CLIENT_ID,
              client_secret: process.env.BANKWAVE_CLIENT_SECRET,
            };

            const config = {
              method: 'POST',
              url: `${BANKWAVE_API_BASE_URL}access-token/`,
              headers: header_options,
              data: auth,
            };

            return await axios(config)
              .then((res) => {
                const { access_token } = res.data;
                header_options['Authorization'] = `Bearer ${access_token}`;

                return access_token;
              })
              .catch((err) => {
                console.log('THE ERROR', err);
              });

            // await needle.post(
            //   `${BANKWAVE_API_BASE_URL}access-token/`,
            //   JSON.stringify(auth),
            //   header_options,
            //   (err, resp) => {
            //     console.log('THE RESP', resp.body, 'AND AUTH', auth);
            //     const { access_token, expires_in } = resp['body'];

            //     if (resp && resp.body.access_token) {
            //       header_options.headers[
            //         'Authorization'
            //       ] = `Bearer ${access_token}`;
            //       // (req.access_token = access_token);
            //       return access_token;
            //     } else {
            //       // res.status(404).json({ error: err });
            //     }
            //   }
            // );
          } catch (error) {
            console.log('THE ERROR', error);
          }
        };

        await generateAccessToken().then(async (res) => {
          if (typeof res === 'string') {
            const { onetap_account_no, contribution_amount } = chama;
            console.log('THE PHONE NUMBER', user_reply_phone_number);
            const data = {
              callback_url: `${process.env.NGROK_DOMAIN}/bankwave/stk-push/callback/`,
              account: onetap_account_no,
              amount: contribution_amount,
              phone_number: user_reply_phone_number,
            };

            const config = {
              method: 'POST',
              url: `${BANKWAVE_API_BASE_URL}transaction/stk-push/`,
              headers: header_options,
              data: data,
            };

            return axios(config)
              .then(async (resp) => {
                //console.log('THE RESPONSE', resp, 'OR ERROR:');
                const { data } = resp.body;
                const {
                  id,
                  account,
                  amount,
                  transaction_type,
                  transaction_category,
                  transaction_status,
                  callback_url,
                  phone_number,
                  created_at,
                  updated_at,
                } = data;
                if (data) {
                  const transactionRef = Collections.doc();

                  let response = {
                    id: id,
                    amount: amount,
                    chama_account: account['account_number'],
                    phone_number: phone_number,
                    transaction_category: transaction_category,
                    transaction_status: transaction_status,
                    transaction_type: transaction_type,
                    created_at: created_at,
                    updated_at: updated_at,
                    callback_url: callback_url,
                  };
                  await transactionRef.set(response);
                }
                return;
                //return res.status(200).json({ data: resp.body });
              })
              .catch((err) => {
                console.log('Errro 2', err);
                return;
                //res.status(400).json({ error: err });
              });

            // await needle.post(
            //   `${BANKWAVE_API_BASE_URL}transaction/stk-push/`,
            //   data,
            //   header_options,
            //   async (err, resp) => {
            //     if (resp) {
            //       console.log('THE RESPONSE', resp, 'OR ERROR:', err);
            //       const { data } = resp.body;
            //       const {
            //         id,
            //         account,
            //         amount,
            //         transaction_type,
            //         transaction_category,
            //         transaction_status,
            //         callback_url,
            //         phone_number,
            //         created_at,
            //         updated_at,
            //       } = data;
            //       if (data) {
            //         const transactionRef = Collections.doc();

            //         let response = {
            //           id: id,
            //           amount: amount,
            //           chama_account: account['account_number'],
            //           phone_number: phone_number,
            //           transaction_category: transaction_category,
            //           transaction_status: transaction_status,
            //           transaction_type: transaction_type,
            //           created_at: created_at,
            //           updated_at: updated_at,
            //           callback_url: callback_url,
            //         };
            //         await transactionRef.set(response);
            //       }
            //       //return res.status(200).json({ data: resp.body });
            //     } else {
            //       //res.status(400).json({ error: err });
            //       return;
            //     }
            //   }
            // );
          }
        });
      }

      if (wekeza_reply) {
        sendMessage(wekeza_reply)
          .then((response) => {
            //console.log('THE WEKEZA WEBHOOK REPLY', response);
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
  setChatReply: setChatReply,
  getWekezaWelcomeMessage: getWekezaWelcomeMessage,
  confirmRecipientMessage: confirmRecipientMessage,
  getMessageId: getMessageId,
  replyMessage: replyMessage,
  message_ids,
  message_types,
};
