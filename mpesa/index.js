const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
require('dotenv').config();
const needle = require('needle');

router.use(body_parser.json());

const API_BASE_URL = process.env.MPESA_DEV_BASE_URL;
const MPESA_BASIC_AUTH = process.env.MPESA_DEV_BASIC_AUTH;

let mpesa_access_token,
  mpesa_token_expiry = null;

router.get('/access_token', async (req, res) => {
  {
    try {
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
            const { errorMessage } = resp.body;
            if (errorMessage) {
              //TODO: Error handling
              console.log('THROW ERROR', errorMessage);
            } else {
              const { access_token, expires_in } = resp.body;
              mpesa_access_token = access_token;
              mpesa_token_expiry = expires_in;
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

//C2B PAYMENTS
router.get('/c2b', async (req, res) => {
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

router.get('/confirmation', async (req, res) => {
  try {
    const data = req.body;
    console.log('THE MPESA DATA CONFIRMATION', data);
  } catch (error) {}
});

router.get('/validation', async (req, res) => {
  try {
    const data = req.body;
    console.log('THE MPESA DATA VALIDATION', data);
  } catch (error) {}
});

//MPESA EXPRESS
router.post('/express', async (req, res) => {
  {
    try {
      console.log('THE TOKEN IS:', mpesa_access_token);
      const options = {
        headers: {
          Authorization: `Bearer ${mpesa_access_token}`,
        },
      };

      const data = {
        BusinessShortCode: 174379,
        Password:
          'MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjMxMDExMDgzNTM4',
        Timestamp: '20231011083538',
        TransactionType: 'CustomerPayBillOnline',
        Amount: 1,
        PartyA: 254712658102,
        PartyB: 174379,
        PhoneNumber: 254712658102,
        CallBackURL: 'https://gentle-glowworm-sharing.ngrok-free.app/callback',
        AccountReference: 'CompanyXLTD',
        TransactionDesc: 'Payment of X',
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

router.get('/callback', async (req, res) => {
  try {
    const data = req.body;
    console.log('THE CALLBACK IS:', data);
  } catch (error) {}
});

module.exports = router;
