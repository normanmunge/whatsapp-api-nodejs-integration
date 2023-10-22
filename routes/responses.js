const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
require('dotenv').config();

const verify_token = process.env.VERIFY_TOKEN;

router.use(body_parser.json());

router.post('/responses', (req, res) => {
  if (req.query.token !== verify_token) {
    return res.sendStatus(401); //unauthorized
  }

  res.sendStatus(201);
  return;
});

module.exports = router;
