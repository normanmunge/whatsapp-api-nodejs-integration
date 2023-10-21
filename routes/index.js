const ENV =
  typeof process.env.NODE_ENV !== 'undefined'
    ? `.env.${process.env.NODE_ENV}`
    : `.env`;
require('dotenv').config({ path: ENV });

const express = require('express');
const router = express.Router();

//routes
const welcomeRouter = require('./welcome');
// const responseRouter = require('./responses');
//const mpesaRouter = require('../mpesa/index');
const bankwaveRouter = require('../mpesa/onetap');

router.get('/test', (req, res) => {
  console.log('THE PROCESS ENV', process.env.RECIPIENT_WAID);
  res.sendStatus(200);
  return;
});

router.get('/', (req, res) => {
  res.send(`Welcome to Wekeza: Serving with this env: ${process.env.NODE_ENV}`);
  return;
});

//mpesa
// router.use('/mpesa', mpesaRouter);

//bankwave
router.use('/bankwave', bankwaveRouter);

//WHATSAPP API ENDPOINTS
router.use('/welcome', welcomeRouter);

//Configure meta webhooks
const metaController = require('../controller/meta-webhooks');
const { connectMetaWehbooks, postMetaWebhooks } = metaController;
router.get('/webhooks', connectMetaWehbooks);
router.post('/webhooks', postMetaWebhooks);

//ENDPOINTS
const chamaController = require('../controller/chama');
const { createChamaMember, getChamaMembers, getChama, createChama } =
  chamaController;
//Chama
router.post('/create-chama', createChama);
router.get('/get-chama/:id', getChama);

//Members
router.post('/create-chama-member', createChamaMember);
router.get('/chama-members', getChamaMembers);

const waitlistController = require('../controller/waitlist');
const { joinList } = waitlistController;
router.post('join-wekeza-list', joinList);

module.exports = router;
