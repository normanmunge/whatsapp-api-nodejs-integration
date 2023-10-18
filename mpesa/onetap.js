const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
require('dotenv').config();
const needle = require('needle');

const { Chama, Reports, ChamaCycleCount } = require('../firebase/Chama');
const { User, getMember } = require('../firebase/User');
const { message_ids, sendMessage, setChatReply } = require('../messages');
const { triggerStkPush, header_options } = require('./methods');

router.use(body_parser.json());

const BANKWAVE_API_BASE_URL = process.env.BANKWAVE_DEV_BASE_URL;
const MPESA_BASIC_AUTH = process.env.MPESA_DEV_BASIC_AUTH;

const getChamaAccountNumber = async () => {
  const { phone } = message_ids[0];
  const member = await getMember(phone);
  const chama_member_snapshot = Chama.doc(member['chama']);
  const chama_doc = await chama_member_snapshot.get();
  //const { onetap_account_no } = chama_doc.data();
  console.log('THE CHAMA DOC', chama_doc.data());
  return chama_doc.data();
};

const generateAccessToken = async (req, res, next) => {
  try {
    const auth = {
      client_id: process.env.BANKWAVE_CLIENT_ID,
      client_secret: process.env.BANKWAVE_CLIENT_SECRET,
    };

    await needle.post(
      `${BANKWAVE_API_BASE_URL}access-token/`,
      JSON.stringify(auth),
      header_options,
      (err, resp) => {
        const { access_token, expires_in } = resp['body'];
        if (resp && resp.body.access_token) {
          (header_options.headers['Authorization'] = `Bearer ${access_token}`),
            (req.access_token = access_token);
          return next();
        } else {
          res.status(404).json({ error: err });
        }
      }
    );
  } catch (error) {
    console.log('THE ERROR', error);
  }
};

router.get('/access_token/', generateAccessToken, async (req, res) => {
  {
    try {
      res.status(200).json({ access_token: req.access_token });
    } catch (error) {
      res.sendStatus(500);
    }
  }
});

router.post('/create-chama-account/', generateAccessToken, async (req, res) => {
  //todo:: delete account -> 362613 && 625555 && 440026 && 534953
  try {
    if (message_ids.length) {
      const { phone } = message_ids[0];
      const member = await getMember(phone);

      const data = {
        account_name: member['name'],
      };
      await needle.post(
        `${BANKWAVE_API_BASE_URL}account/`,
        data,
        header_options,
        async (err, resp) => {
          if (resp) {
            if (phone) {
              const { account_name, account_number, created_at } = resp['body'];

              const chamaRef = Chama.doc(member['chama']);

              const registrationRef = Reports.doc();
              await registrationRef.set({
                name: name,
                email: email,
                phone: phone,
              });

              return res.status(201).json(`Successful`);
            }

            return;
          } else {
            return res.status(400).json({ erorr: err });
          }
        }
      );
    }
  } catch (error) {
    console.log('THE ERROR', error);
  }
});

router.get(
  '/get-chama-account-number/',
  generateAccessToken,
  async (req, res) => {
    try {
      const { onetap_account_no } = getChamaAccountNumber();
      console.log(
        'THE ACCOUNT NUMBER',
        onetap_account_no,
        'THE HEADER OPTIONS',
        header_options
      );

      await needle.get(
        `${BANKWAVE_API_BASE_URL}account/${onetap_account_no}/`,
        header_options,
        (err, resp) => {
          console.log('RESPONSE', resp.body);
          if (resp) {
            res.status(200).json(resp.body);
          } else {
            console.log('the error', err);
            res.status(400).json({ error: err });
            return;
          }
        }
      );
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }
);

router.post('/trigger-stk-push/', generateAccessToken, async (req, res) => {
  try {
    let chama,
      phone = null;

    if (req.body) {
      chama = req.body.chama || (await getChamaAccountNumber());
      phone = req.body.phone || message_ids[0].phone;
    }
    if (chama && phone) {
      await triggerStkPush(chama, phone);
      // const { onetap_account_no, contribution_amount } = chama;
      // const data = {
      //   callback_url: `https://${process.env.NGROK_DOMAIN}/stk-push/callback/`,
      //   account: onetap_account_no,
      //   amount: contribution_amount,
      //   phone_number: phone,
      // };

      // await needle.post(
      //   `${BANKWAVE_API_BASE_URL}transaction/stk-push/`,
      //   data,
      //   header_options,
      //   async (err, resp) => {
      //     if (resp) {
      //       const { data } = resp;
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
      //       return res.status(200).json({ data: resp.body });
      //     } else {
      //       res.status(400).json({ error: err });
      //       return;
      //     }
      //   }
      // );
    }

    // const { onetap_account_no, contribution_amount } =
    //   await getChamaAccountNumber();

    // const { phone } = message_ids[0];
    // const data = {
    //   callback_url: `https://${process.env.NGROK_DOMAIN}/stk-push/callback/`,
    //   account: onetap_account_no,
    //   amount: contribution_amount,
    //   phone_number: phone,
    // };

    // await needle.post(
    //   `${BANKWAVE_API_BASE_URL}transaction/stk-push/`,
    //   data,
    //   header_options,
    //   (err, resp) => {
    //     if (resp) {
    //       //todo: save the stk credit transactions to our DB
    //       // {
    //       //     "data": {
    //       //         "id": "eecae2d9-b0a9-4675-a3b5-599356c9f9f1",
    //       //         "account": {
    //       //             "account_name": "Norman Munge",
    //       //             "account_number": "534953"
    //       //         },
    //       //         "amount": 10,
    //       //         "transaction_type": "stk-push",
    //       //         "transaction_category": "credit",
    //       //         "transaction_status": "in_progress",
    //       //         "callback_url": "https://gentle-glowworm-sharing.ngrok-free.app/stk-push/callback/",
    //       //         "phone_number": "254712658102",
    //       //         "created_at": "2023-10-14T07:29:40.629820Z",
    //       //         "updated_at": "2023-10-14T07:29:40.629855Z"
    //       //     }
    //       // }
    //       res.status(200).json({ data: resp.body });
    //     } else {
    //       res.status(400).json({ error: err });
    //       return;
    //     }
    //   }
    // );
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

router.post('/check-transaction-status', async (req, res) => {
  try {
    //retrieve from DB
    const transaction_id = 'eecae2d9-b0a9-4675-a3b5-599356c9f9f1';

    await needle.get(
      `${BANKWAVE_API_BASE_URL}transaction/${transaction_id}/`,
      header_options,
      (err, res) => {
        if (res) {
          console.log('the response of transaction status ', res.body);
        } else {
        }
      }
    );
  } catch (error) {}
});

router.post('/stk-push/callback/', generateAccessToken, async (req, res) => {
  try {
    console.log('THE CALLBACK BANKWAVE URL STK CALLBACK', req.body);
    const { account, amount } = req.body;
    const { account_number } = account;
    //todo: update the chama member reports
    if (req.body.transaction_status === 'completed') {
      const member = await getMember(req.body.phone_number);
      console.log('AUTOMATE THE SENDING TO RECIPIENT NOW 1', member);

      // const { onetap_account_no, contribution_amount, recipient_number } =
      // await getChamaAccountNumber();

      const data = {
        callback_url: `${process.env.NGROK_DOMAIN}/send-money/callback/`,
        account: account_number,
        amount: amount,
        receiver_phone_number: member['next_recipient_member']?.phone_number,
      };
      await needle.post(
        `${BANKWAVE_API_BASE_URL}transaction/send-to-phone-number/`,
        data,
        header_options,
        async (err, resp) => {
          if (resp) {
            console.log(
              'the response to send money to next recipient using stk push:',
              resp.body
            );
            //todo: change recipient number after cycle count complete or when admin triggers
            //todo: save the stk debit transfer transactions to our DB

            //           {
            // 	"data": {
            // 		"id": "079545da-d6a9-4d0b-ac51-05b835eaf8b7",
            // 		"account": {
            // 			"account_name": "Norman Munge",
            // 			"account_number": "534953"
            // 		},
            // 		"amount": 10,
            // 		"transaction_type": "send-to-phone-number",
            // 		"transaction_category": "debit",
            // 		"transaction_status": "in_progress",
            // 		"callback_url": "https://gentle-glowworm-sharing.ngrok-free.app/send-money/callback/",
            // 		"receiver_phone_number": "254712658102",
            // 		"created_at": "2023-10-14T07:48:22.958671Z",
            // 		"updated_at": "2023-10-14T07:48:22.958711Z"
            // 	}
            // }
            if (req.body.transaction_status === 'in_progress') {
              const reply_to_user =
                "Sending. We'll notify you when the transaction is done!";
              const chat_reply = setChatReply(
                reply_to_user,
                req.body.phone_number
              );

              await sendMessage(chat_reply)
                .then(async (response) => {
                  console.log(
                    'THE SEND MESSAGE MPESA IN PROGRESS WEBHOOK REPLY',
                    response
                  );
                  if (response.status === 200) {
                    const member = await getMember(receiver_phone_number);
                    console.log(
                      'THE SEND MESSAGE MPESA IN PROGRESS WEBHOOK REPLY 2',
                      member
                    );

                    const reportsRef = Reports.doc();

                    await reportsRef.set({
                      amount_received: amount,
                      chama: member['chama'],
                      date_of_payment: created_at,
                      member: member['next_recipient_id'], //recipient,
                      member_phone: receiver_phone_number,
                    });

                    //update chama cycle count
                    const total_chama_members = await User.where(
                      'chama',
                      '==',
                      chama
                    ).get();

                    let next_recipient_cycle =
                      cycle_count === total_chama_members.size
                        ? 1
                        : member['cycle_count'] + 1;

                    const chamaRef = Chama.doc(member['chama']);
                    await chamaRef.update({
                      current_cycle_count: next_recipient_cycle,
                    });

                    res.status(200).end();
                  } else {
                    mpesa_confirmation = 'Cash not sent!!!';
                    res.status(400).end();
                  }
                })
                .catch((error) => {
                  res.status(400).end();
                });
            }

            res.sendStatus(200);
          } else {
            console.log('the error', err);
            res.sendStatus(400);
          }
        }
      );
    } else {
      const mpesa_confirmation =
        'Failed! Kindly contact the Wekeza Administrator';
      console.log('Failed', mpesa_confirmation);
      // const chat_reply = setChatReply(
      //   mpesa_confirmation,
      //   req.body.phone_number
      // );

      // await sendMessage(chat_reply)
      //   .then((response) => {
      //     //console.log('THE WEKEZA WEBHOOK REPLY', response);
      //     if (response.status === 200) {
      //       return res.status(200).json({ data: resp.body });
      //     }
      //   })
      //   .catch((err) => {
      //     console.log('THE ERROR:', err);
      //   });
    }
    return res.end();
  } catch (error) {
    console.log('THE STK CALLBACK ERROR:', error);
    return res.status(400).end();
  }
});

router.post('/send-to-phonenumber/', generateAccessToken, async (req, res) => {
  const { onetap_account_no, contribution_amount, recipient_number } =
    await getChamaAccountNumber();

  const data = {
    callback_url: `https://${process.env.NGROK_DOMAIN}/send-money/callback/`,
    account: onetap_account_no,
    amount: contribution_amount,
    receiver_phone_number: recipient_number,
  };

  await needle.post(
    `${BANKWAVE_API_BASE_URL}transaction/send-to-phone-number/`,
    data,
    header_options,
    (err, resp) => {
      if (resp) {
        console.log('the response to send money to next recipient', resp.body);
        //todo: change recipient number after cycle count complete or when admin triggers
        //todo: save the stk debit transfer transactions to our DB
        //           {
        // 	"data": {
        // 		"id": "079545da-d6a9-4d0b-ac51-05b835eaf8b7",
        // 		"account": {
        // 			"account_name": "Norman Munge",
        // 			"account_number": "534953"
        // 		},
        // 		"amount": 10,
        // 		"transaction_type": "send-to-phone-number",
        // 		"transaction_category": "debit",
        // 		"transaction_status": "in_progress",
        // 		"callback_url": "https://gentle-glowworm-sharing.ngrok-free.app/send-money/callback/",
        // 		"receiver_phone_number": "254712658102",
        // 		"created_at": "2023-10-14T07:48:22.958671Z",
        // 		"updated_at": "2023-10-14T07:48:22.958711Z"
        // 	}
        // }

        res.status(200);
      } else {
        console.log('the error', err);
        res.status(400);
      }
    }
  );
});

router.post('/send-money/callback/', async (req, res) => {
  try {
    console.log('THE CALLBACK BANKWAVE URL SEND MONEY', req.body);
    const { account, amount, created_at, receiver_phone_number } = req.body;
    const { account_number } = account;
    //todo: update the chama member reports
    //todo: update the reports of the recipient amount
    let mpesa_confirmation = 'Cash sent successfully!!';

    if (req.body.transaction_status === 'completed') {
      console.log('SENT SUCCESSFULLY', mpesa_confirmation);
      const chat_reply = setChatReply(
        mpesa_confirmation,
        req.body.phone_number
      );
      console.log('GETS HERE TO SEND CONFIRMATION REPORT', chat_reply);
      await sendMessage(chat_reply)
        .then(async (response) => {
          console.log('THE SEND MESSAGE BANKWAVE WEBHOOK REPLY', response);
          if (response.status === 200) {
            const member = await getMember(receiver_phone_number);
            console.log('SENT THE CASH TO RECIPIENT', member);

            // const reportsRef = Reports.doc();

            // await reportsRef.set({
            //   amount_received: amount,
            //   chama: member['chama'],
            //   date_of_payment: created_at,
            //   member: member['next_recipient_id'], //recipient,
            //   member_phone: receiver_phone_number,
            // });
            res.status(200).end();
          } else {
            mpesa_confirmation = 'Cash not sent!!!';
            res.status(400).end();
          }
        })
        .catch((error) => {
          res.status(400).end();
        });
    }
    return res.end();
  } catch (error) {
    return res.status(400).json({ error: error }).end();
  }
});

router.post('/send-to-paybill/', generateAccessToken, async (req, res) => {
  //should send to
  try {
  } catch (error) {}
});

router.post('/send-to-phonenumber/', generateAccessToken, async (req, res) => {
  try {
  } catch (error) {}
});

//C2B PAYMENTS
// router.get('/c2b', generateAccessToken, async (req, res) => {
//   try {
//     const options = {};
//     await needle.post(
//       `${BANKWAVE_API_BASE_URL}mpesa/c2b/v1/simulate`,
//       options,
//       (err, resp) => {
//         console.log('THE ERROR', err);
//         console.log('THE RESP', resp.body);
//       }
//     );
//   } catch (error) {}
// });

// router.get('/confirmation', generateAccessToken, async (req, res) => {
//   try {
//     const data = req.body;
//     console.log('THE MPESA DATA CONFIRMATION', data);
//   } catch (error) {}
// });

// router.get('/validation', generateAccessToken, async (req, res) => {
//   try {
//     const data = req.body;
//     console.log('THE MPESA DATA VALIDATION', data);
//   } catch (error) {}
// });

//MPESA STK-PUSH REQUEST
router.post('/express', generateAccessToken, async (req, res) => {
  {
    try {
      console.log('THE TOKEN IS:', req.access_token);
      const options = {
        headers: {
          Authorization: `Bearer ${req.access_token}`,
          'Content-Type': 'application/json',
        },
      };

      const short_code = 174379; //Sandbox Test - 174379;
      const passkey = `${process.env.MPESA_PASS_KEY}`;

      //todo: create a generic function to simplify this.
      const date = new Date();
      const year = date.getFullYear();
      const month =
        date.getMonth() + 1 < 10 ? `0${date.getMonth()}` : date.getMonth() + 1; //todo: add check for month > 12
      const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
      const hours =
        date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
      const minutes =
        date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
      const seconds =
        date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
      const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

      const business_password = Buffer.from(
        `${short_code}${passkey}${timestamp}`
      ).toString('base64');

      console.log(
        'THE TIMESTAMP',
        timestamp,
        'THE PASSWORD:',
        business_password,
        'DOMAIN',
        process.env.NGROK_DOMAIN
      );

      const data = {
        BusinessShortCode: short_code,
        Password: business_password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline', //Till number => CustomerBuyGoodsOnline //Paybill -> CustomerPayBillOnline
        Amount: 1,
        PartyA: 254712658102, //phone number sending money ... 254712658102
        PartyB: short_code, //similar to short code
        PhoneNumber: 254712658102, //mobile number to receive stk push
        CallBackURL: `${process.env.NGROK_DOMAIN}/mpesa/callback`, //callback to receive updates from MPESA API
        AccountReference: 'Wekeza',
        TransactionDesc: 'Payment Chama', //description of transaction
      };

      await needle.post(
        `${BANKWAVE_API_BASE_URL}mpesa/stkpush/v1/processrequest`,
        JSON.stringify(data),
        options,
        (err, resp) => {
          // console.log('THE ERR', err);
          console.log('THE RESP IS:', resp.body);
          if (resp && resp.body) {
            const { errorMessage } = resp.body;
            if (errorMessage) {
              //TODO: Error handling
              console.log('THROW ERROR', errorMessage);
            } else {
            }
          }
        }
      );
      res.sendStatus(200);
    } catch (error) {
      res.sendStatus(500);
    }
  }
});

//MPESA B2C Endpoints
// router.post('/b2c', generateAccessToken, async (req, res) => {
//   try {
//     const options = {
//       headers: {
//         Authorization: `Bearer ${req.access_token}`,
//         'Content-Type': 'application/json',
//       },
//     };
//     const data = {};
//     await needle.post(
//       `${BANKWAVE_API_BASE_URL}mpesa/b2c/v3/paymentrequest`,
//       JSON.stringify(data),
//       options,
//       (err, resp) => {}
//     );
//   } catch (error) {}
// });

//MPESA CALLBACK URL
// router.post('/callback', async (req, res) => {
//   try {
//     if (req.body) {
//       const request = req.body.Body.stkCallback;

//       const merchantRequestId = request.MerchantRequestID; //store this in DB
//       const checkoutRequestId = request.CheckoutRequestID; //store this in DB

//       const resultCode = request.ResultCode;
//       const resultDesc = request.ResultDesc;

//       switch (resultCode) {
//         case 0:
//           const results = request?.CallbackMetadata?.Item;

//           if (results) {
//             console.log('THE CALLBACK IS:', results);

//             //todo: store the data in firebase
//             results.forEach((data) => {
//               console.log('THE DATA:', data.Name, 'THE VALUE:', data.Value);
//               switch (data.Name) {
//                 case 'Amount':
//                   console.log('THE AMOUNT', data.Name, 'OF VALUE', data.Value);
//                   break;
//                 case 'MpesaReceiptNumber':
//                   console.log('THE RECEIPT', data.Name, 'OF VALUE', data.Value);
//                   break;
//                 case 'Balance':
//                   console.log(
//                     'THE BALANCE OF THE SHORT CODE',
//                     data.Name,
//                     'OF VALUE',
//                     data.Value
//                   );
//                   break;
//                 case 'TransactionDate':
//                   console.log(
//                     'THE DATE',
//                     data.Name,
//                     'OF VALUE',
//                     data.Value,
//                     'formatted:',
//                     toLocaleDateString('en-US', {
//                       weekday: 'long',
//                       year: 'numeric',
//                       month: 'long',
//                       day: 'numeric',
//                     })
//                   );
//                   break;
//                 case 'PhoneNumber':
//                   console.log(
//                     'THE phone number',
//                     data.Name,
//                     'OF VALUE',
//                     data.Value
//                   );
//                   break;

//                 default:
//                   break;
//               }
//             });
//           }
//           break;
//         case 1: // The balance is insufficient for the transaction.
//           break;
//         case 2001: //The user initiating the push has given invalid password input
//           break;
//         case 1019: //Transaction has expired
//           break;
//         case 1001: //Unable to lock subscriber, a transaction is already in process for the current subscriber
//           break;
//         default:
//           //it's an error
//           //result code = 1032 - The request was canceled by the user
//           //1037 - No response from the user
//           //1025, 9999, - An error occurred while sending a push request
//           //1037 - DS timeout user cannot be reached
//           //1019 - Transaction has expired
//           break;
//       }
//     }
//   } catch (error) {
//     console.log('THE ERRORS:', error);
//   }
// });

module.exports = router;
