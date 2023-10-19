const ENV =
  typeof process.env.NODE_ENV !== 'undefined'
    ? `.env.${process.env.NODE_ENV}`
    : `.env`;

const setChamaProfileText = () => {
  console.log('THE ENVIRONMENT IS:', ENV);
  let chama_profile_text = ENV.includes('.dev')
    ? 'Your Chama Profile'
    : 'View Chama Profile';

  return chama_profile_text;
};

module.exports = { setChamaProfileText };
