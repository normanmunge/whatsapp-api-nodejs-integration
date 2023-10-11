const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
require('dotenv').config();
const needle = require('needle');

router.use(body_parser.json());

const API_BASE_URL = process.env.MPESA_DEV_BASE_URL;
const MPESA_BASIC_AUTH = process.env.MPESA_DEV_BASIC_AUTH;

const generateAccessToken = async (req, res, next) => {
  const auth = Buffer.from(
    `${process.env.MPESA_DEV_CONSUMER_KEY}:${process.env.MPESA_DEV_CONSUMER_SECRET}`
  ).toString('base64');
  console.log('THE AUTH IS:', auth);
  const options = {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  };
  await needle.get(
    `${API_BASE_URL}oauth/v1/generate?grant_type=client_credentials`,
    options,
    (err, resp) => {
      // console.log('THE ERR', err);
      console.log('THE RESP IS:', resp.body);
      if (resp && resp.body) {
        let mpesa_access_token,
          mpesa_token_expiry = null;

        const { errorMessage } = resp.body;
        if (errorMessage) {
          //TODO: Error handling
          console.log('THROW ERROR', errorMessage);
        } else {
          const { access_token, expires_in } = resp.body;
          mpesa_access_token = access_token;
          mpesa_token_expiry = expires_in;
          req.access_token = mpesa_access_token;
          next();
        }
      }
    }
  );
};
router.get('/access_token', generateAccessToken, async (req, res) => {
  {
    try {
      res.status(200).json({ access_token: req.access_token });
    } catch (error) {
      res.sendStatus(500);
    }
  }
});

//C2B PAYMENTS
router.get('/c2b', generateAccessToken, async (req, res) => {
  try {
    const options = {};
    await needle.post(
      `${API_BASE_URL}mpesa/c2b/v1/simulate`,
      options,
      (err, resp) => {
        console.log('THE ERROR', err);
        console.log('THE RESP', resp.body);
      }
    );
  } catch (error) {}
});

router.get('/confirmation', generateAccessToken, async (req, res) => {
  try {
    const data = req.body;
    console.log('THE MPESA DATA CONFIRMATION', data);
  } catch (error) {}
});

router.get('/validation', generateAccessToken, async (req, res) => {
  try {
    const data = req.body;
    console.log('THE MPESA DATA VALIDATION', data);
  } catch (error) {}
});

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
        `${API_BASE_URL}mpesa/stkpush/v1/processrequest`,
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
router.post('/b2c', generateAccessToken, async (req, res) => {
  try {
    const options = {
      headers: {
        Authorization: `Bearer ${req.access_token}`,
        'Content-Type': 'application/json',
      },
    };
    const data = {};
    await needle.post(
      `${API_BASE_URL}mpesa/b2c/v3/paymentrequest`,
      JSON.stringify(data),
      options,
      (err, resp) => {}
    );
  } catch (error) {}
});

//MPESA CALLBACK URL
router.post('/callback', async (req, res) => {
  try {
    if (req.body) {
      const request = req.body.Body.stkCallback;

      const merchantRequestId = request.MerchantRequestID; //store this in DB
      const checkoutRequestId = request.CheckoutRequestID; //store this in DB

      const resultCode = request.ResultCode;
      const resultDesc = request.ResultDesc;

      switch (resultCode) {
        case 0:
          const results = request?.CallbackMetadata?.Item;

          if (results) {
            console.log('THE CALLBACK IS:', results);

            //todo: store the data in firebase
            results.forEach((data) => {
              console.log('THE DATA:', data.Name, 'THE VALUE:', data.Value);
              switch (data.Name) {
                case 'Amount':
                  console.log('THE AMOUNT', data.Name, 'OF VALUE', data.Value);
                  break;
                case 'MpesaReceiptNumber':
                  console.log('THE RECEIPT', data.Name, 'OF VALUE', data.Value);
                  break;
                case 'Balance':
                  console.log(
                    'THE BALANCE OF THE SHORT CODE',
                    data.Name,
                    'OF VALUE',
                    data.Value
                  );
                  break;
                case 'TransactionDate':
                  console.log(
                    'THE DATE',
                    data.Name,
                    'OF VALUE',
                    data.Value,
                    'formatted:',
                    toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  );
                  break;
                case 'PhoneNumber':
                  console.log(
                    'THE phone number',
                    data.Name,
                    'OF VALUE',
                    data.Value
                  );
                  break;

                default:
                  break;
              }
            });
          }
          break;
        case 1: // The balance is insufficient for the transaction.
          break;
        case 2001: //The user initiating the push has given invalid password input
          break;
        case 1019: //Transaction has expired
          break;
        case 1001: //Unable to lock subscriber, a transaction is already in process for the current subscriber
          break;
        default:
          //it's an error
          //result code = 1032 - The request was canceled by the user
          //1037 - No response from the user
          //1025, 9999, - An error occurred while sending a push request
          //1037 - DS timeout user cannot be reached
          //1019 - Transaction has expired
          break;
      }
    }
  } catch (error) {
    console.log('THE ERRORS:', error);
  }
});

module.exports = router;
