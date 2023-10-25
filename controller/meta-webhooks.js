//messages
const {
  sendMessage,
  replyMessage,
  getWekezaWelcomeMessage,
  message_types,
} = require('../messages');

const { setChamaProfileText } = require('../utils/utils');
const { fetchChamaMemberByPhone } = require('../utils/member');
const { fetchChama } = require('../utils/chama');
class MetaWebhookController {
  static verify_token = process.env.VERIFY_TOKEN;
  //static cache_message_ids = [];

  constructor() {}

  async connectMetaWehbooks(req, res) {
    try {
      const verify_token = process.env.VERIFY_TOKEN;
      console.log(
        'THE VERIFY TOKEN IS:',
        verify_token,
        'AND THE META QUERY',
        req.query
      );
      if (
        req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === verify_token
      ) {
        res.send('Verified');
      } else {
        res.sendStatus(400);
      }
    } catch (err) {
      console.log('ERROR', err);
      res.sendStatus(400);
    }
  }

  async postMetaWebhooks(req, res) {
    try {
      //resource: https://business.whatsapp.com/blog/how-to-use-webhooks-from-whatsapp-business-api

      const body = req.body;
      if (body.object !== 'whatsapp_business_account') {
        // not from the whatsapp business webhook so dont process
        return res.sendStatus(400);
      }

      const user_reply = body.entry[0];
      console.log('THE WEBHOOK reply:', user_reply);

      //Initialise member;
      let chama_member = null;
      let type_of_chama = null;

      //Cache webhooks
      let cache_message_ids = {};

      if (user_reply) {
        //webhook
        const { id, changes } = user_reply;
        // console.log('THE WEBHOOK ID:', id);

        // if (!cache_message_ids.length || webhook_id !== cache_message_ids[0]) {
        //business details

        //const display_phone_number = value.metadata.display_phone_number;
        //const phone_number_id = value.metadata.phone_number_id;

        // console.log(
        //   'THE BUSINESS DETAILS: DISPLAY PHONE NUMBER',
        //   display_phone_number,
        //   '& PHONE ID',
        //   phone_number_id
        // );
        //console.log('THE PHONE NUMBER', value);
        const { value } = changes[0];
        let user_reply_initiated = false;

        const getChamaMember = async (user_reply_phone_number) => {
          try {
            chama_member = await fetchChamaMemberByPhone(
              user_reply_phone_number
            );
            if (chama_member) {
              const { chama_id, id } = chama_member;
              type_of_chama = await fetchChama(chama_id, id);
              return { type_of_chama, chama_member };
            }
          } catch (error) {
            console.log('THE ERROR TO GET MEMBER - GET CHAMA MEMBER', error);
          }
        };

        //message received from user
        if (typeof value['contacts'] !== 'undefined' && value.contacts.length) {
          //client profile details
          const { profile, wa_id } = value.contacts[0];
          const user_reply_name = profile.name;
          const user_reply_phone_number = wa_id;

          const { type_of_chama, chama_member } = getChamaMember(
            user_reply_phone_number
          );

          //client message details
          const { timestamp, type, text, button } = value.messages[0];
          const message_time = timestamp;
          const message_type = type;
          const message_id = value.messages[0].id;

          let message_text = '';
          switch (message_type) {
            case 'text':
              message_text = text.body;
              break;
            case 'button':
              message_text = button.text;
            default:
              break;
          }

          // console.log(
          //   'THE MESSAGE DETAILS: TIME',
          //   message_time,
          //   '& THE TYPE',
          //   message_type,
          //   '& THE MESSAGE ID',
          //   message_id,
          //   '& THE MESSAGE TEXT',
          //   message_text
          // );

          //TODO: Store the user message details to our logs
          //After storing the logo, mark message as read

          /**
           * Marks the message as received and read with the blue ticks check on Whatsapp.
           */
          const data = {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: message_id,
          };

          if (data) {
            await sendMessage(data)
              .then((response) => {
                if (response.data?.success) {
                  user_reply_initiated = true;
                }
              })
              .catch((err) => {
                console.log('THE ERROR:');
                res.end();
              });
          }
        }

        //message sent to user
        if (user_reply_initiated && typeof value['messages'] !== 'undefined') {
          const message = await value.messages[0];
          const message_type = message.type;
          const message_from = message.from; //user phone number;

          const { type_of_chama, chama_member } = getChamaMember(message_from);
          //TODO: Store the logs for the customer journey i.e their most frequently selected option.
          // console.log('THE MESSAGE IS:', message.button.payload);
          if (typeof message === 'object') {
            if (typeof cache_message_ids[message.id] === 'undefined') {
              const message_to_send = async (type) => {
                return await replyMessage(
                  message_types[type],
                  user_reply_initiated,
                  message_from,
                  type_of_chama,
                  chama_member
                );
              };
              switch (message_type) {
                case 'button':
                  const message_button_payload = await message.button.payload;
                  let chama_profile_text = setChamaProfileText();
                  switch (message_button_payload) {
                    case chama_profile_text:
                      return await message_to_send('chama_profile');

                      break;
                    case 'Send Contribution':
                      /**
                       * Check next recipient
                       * Send Confirm phone number of next recipient
                       * If send, prompt STK push
                       * If no, give options and let user choose
                       */
                      return await message_to_send('send_contrib');
                      break;
                    case 'Stop promotions':
                      console.log('STOP THE PROMOTIONS MESSAGES');
                      break;
                    case 'Confirm':
                      return await message_to_send('send_confirm_contrib');
                      break;
                    default:
                      break;
                  }
                  break;
                case 'text':
                  const checkIfUserRegistered = chama_member;

                  console.log('THE CHAMA MEMBER', checkIfUserRegistered);

                  //User isn't registered in our chama.
                  if (!checkIfUserRegistered) {
                    const message = await message_to_send('register');
                    console.log('User not registered', message);

                    if (message) {
                      cache_message_ids[message.id] = message.id;
                    }
                    return res.sendStatus(200);
                  }

                  const data = getWekezaWelcomeMessage(
                    message_from,
                    'Welcome to Wekeza!'
                  );
                  //todo:// make send welcome message re-usable
                  await sendMessage(data)
                    .then((response) => {
                      const { contacts, messages } = response.data;
                      const user_reply_phone_number = contacts[0].wa_id;
                      const message_id = messages[0].id;

                      req.user_phone = user_reply_phone_number;

                      return res.sendStatus(200);
                    })
                    .catch((err) => {
                      console.log('THE ERROR', err.response['data']);
                      return res.sendStatus(400);
                    });

                //TODO: Store message detail logs:
                default:
                  break;
              }
              //let's cache this webhook
              cache_message_ids[message.id] = message.id;
            }
          }
        }
        // }
      }
      return res.end();
    } catch (error) {
      console.log('IS THERE AN ERROR:', error);
      return res.sendStatus(500);
    }
  }
}

module.exports = new MetaWebhookController();
