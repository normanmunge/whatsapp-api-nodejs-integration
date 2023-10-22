const { Collections } = require('../firebase/Transactions');
const needle = require('needle');
const BANKWAVE_API_BASE_URL = process.env.BANKWAVE_DEV_BASE_URL;
let header_options = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const triggerStkPush = async (chama, phone) => {
  const { wekeza_account_no, contribution_amount } = chama;

  const data = {
    callback_url: `https://${process.env.NGROK_DOMAIN}/stk-push/callback/`,
    account: wekeza_account_no,
    amount: contribution_amount,
    phone_number: phone,
  };

  await needle.post(
    `${BANKWAVE_API_BASE_URL}transaction/stk-push/`,
    data,
    header_options,
    async (err, resp) => {
      if (resp) {
        const { data } = resp;
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
        res.status(200).json({ data: resp.body });
      } else {
        res.status(400).json({ error: err });
      }
      next();
    }
  );
};

module.exports = { triggerStkPush, header_options };
