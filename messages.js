const axios = require('axios');
require('dotenv').config;
const express = require('express');
const router = express.Router();
const needle = require('needle');

const { User, getMemberDetails } = require('./firebase/User');
const { Joinlist } = require('./firebase/JoinList');
const bankwaveRouter = require('./mpesa/onetap');
const { triggerStkPush, generateAccessToken } = require('./mpesa/methods');
const { Collections } = require('./firebase/Transactions');
const { setChamaProfileText } = require('./utils/utils');
const transactionService = require('./service/transactions');

let chama_profile_text = setChamaProfileText();

message_types = {
  chama_profile: chama_profile_text,
  send_contrib: 'Send Contribution' || 'Send Contributions',
  send_confirm_contrib: 'Confirm',
  stop_promotions: 'Stop promotions',
  register: 'Register',
};

//send message to whatsapp
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
      name: 'send_contributions',
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

  const { deadline_date, frequency_contribution } = chama;

  let next_month;

  //the frequency contains a digit so it's after n days
  if (/\d/.test(frequency_contribution)) {
    const pattern = /\d+/g;
    const dayFrequency = parseInt(frequency_contribution.match(pattern)[0]);

    deadline_date = `${deadline_date + dayFrequency}`;
    next_month = `${months_of_the_year[date.getMonth()]} ${current_year}`;
  } else {
    //monthly;
    next_month = `${chama_cycle_next_month} ${current_year}`;
  }

  const date_suffix =
    (deadline_date >= 4 && deadline_date <= 20) ||
    (deadline_date >= 24 && deadline_date <= 30)
      ? 'th'
      : ['st', 'nd', 'rd'][(deadline_date % 10) - 1];

  return {
    chama_cycle_next_date: next_month,
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
  user_reply_phone_number,
  chama,
  member
) => {
  if (user_reply_initiated) {
    //POSTGRES
    let wekeza_reply = null;
    let details;

    if (typeof chama !== 'undefined' || typeof member !== 'undefined') {
      const chama_member = { member: member };
      details = Object.assign(chama, chama_member);
    }

    if (typeof details === 'object') {
      const {
        member,
        current_cycle_count,
        frequency,
        next_recipient,
        total_contributions,
        your_contributions,
        paid_members,
      } = details;

      const { name, id, is_official, whatsapp_opt_in } = member;
      const { contribution_amount, deadline_day, extension_period } = frequency; //frequency.frequency

      if (type.includes('Chama Profile')) {
        //Sets up the next chama cycle date:

        //const { chama_cycle_next_date, deadline_date } = await dateLogic(chama);
        let contribution_reply = `Hello ${name}, \n Here's your *_${details.name}_* update: \n\n Total Chama Contribution: \n KES ${total_contributions} \n Your Individual Contribution: \n KES ${your_contributions} \n\n  Next cycle recipient: ${next_recipient['name']} (+${next_recipient['phone_number']}). \n\n Stay connected and keep contributing!`;

        let paid_member_list_reply = '';

        if (paid_members.length) {
          paid_members.forEach((i, ind) => {
            paid_member_list_reply += `${ind + 1}. ${i.name} - +${
              i.phone_number
            } ✅ \n`;
          });

          contribution_reply = `\n\n ${contribution_reply} \n _*List of paid members*_ \n ${paid_member_list_reply}`;
        }

        wekeza_reply = await setChatReply(
          contribution_reply,
          user_reply_phone_number
        );
      } else if (type.includes('Contribution')) {
        //TODO: //WHAT IF USER SENDS A TEXT THAT CONTAINS THIS
        try {
          wekeza_reply = await confirmRecipientMessage(
            user_reply_phone_number,
            next_recipient
          );

          let loading_message = `Just a second. We're retrieving the details of the next recipient for your confirmation and will generate an Mpesa prompt swiftly.`;
          const reply = await setChatReply(
            loading_message,
            user_reply_phone_number
          );
          sendMessage(reply)
            .then(async (response) => {
              if (response.status === 200) {
                return response.status;
              }
            })
            .catch((err) => {
              //TODO: Configure error-handling messages
              const error = err.response['data'];
              console.log('THE ERROR - SENDING MESSAGE:', error);
            });
        } catch (error) {
          console.log('THE ERROR WHEN TRIGGERING STK PUS');
        }
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
                console.log(
                  'THE ERROR: SEND CONTRIBUTION GENERATE ACCESS TOKEN:',
                  err
                );
              });
          } catch (error) {
            console.log('THE ERROR SEND CONTRIBUTION 2', error);
          }
        };

        await generateAccessToken().then(async (res) => {
          try {
            if (typeof res === 'string') {
              const { wekeza_account_no, frequency } = chama;
              const data = {
                callback_url: `${process.env.NGROK_DOMAIN}/bankwave/stk-push/callback/`,
                account: wekeza_account_no,
                amount: frequency.contribution_amount,
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
                  console.log('THE RESPONSE', resp.data);
                  return resp.status;
                })
                .catch((err) => {
                  console.log('Error with the STK PUSH', err);
                  return;
                });
            }
          } catch (error) {
            console.log('THE ERROR WHEN TRYING TO SEND STK PUSH', error);
          }
        });
      }
    } else {
      const registration_reply = `Thank you for reaching out to us! \n\n We can't wait to get you officially registered onto our platform! 😊 \n\n Our customer support team will be in touch with you soon. In the meantime, feel free to reach out to us directly through the phone number or by dropping us an email. You can find our contact details on our WhatsApp profile. \n\n Your journey with us is about to get even better. Thanks for choosing Wekezafrica!`;
      wekeza_reply = await setChatReply(
        registration_reply,
        user_reply_phone_number
      );

      //todo check if the phone number is already registered
      const user_snapshot = await Joinlist.where(
        'phone',
        '==',
        user_reply_phone_number
      ).get();

      if (user_snapshot.size < 1) {
        const registrationRef = Joinlist.doc();
        await registrationRef.set({
          name: null,
          email: null,
          phone: user_reply_phone_number,
          source: 'whatsapp',
        });
      }
    }
    if (wekeza_reply) {
      return sendMessage(wekeza_reply)
        .then((response) => {
          if (response.status === 200) {
            return response.status;
          }
        })
        .catch((err) => {
          //TODO: Configure error-handling messages
          const error = err.response['data'];
          console.log('THE ERROR - SENDING MESSAGE:', error);
          return;
        });
    }
  }
};

module.exports = {
  sendMessage: sendMessage,
  setChatReply: setChatReply,
  getWekezaWelcomeMessage: getWekezaWelcomeMessage,
  confirmRecipientMessage: confirmRecipientMessage,
  replyMessage: replyMessage,
  message_types,
};
