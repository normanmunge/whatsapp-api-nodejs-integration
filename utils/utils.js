const ENV =
  typeof process.env.NODE_ENV !== 'undefined'
    ? `.env.${process.env.NODE_ENV}`
    : `.env`;

const setEnvironment = () => {
  const environment = ENV;
  if (environment.includes('.dev')) {
    return 'development';
  } else if (environment.includes('.staging')) {
    return 'staging';
  } else {
    return 'production';
  }
};
const setChamaProfileText = () => {
  console.log('THE ENVIRONMENT IS:', ENV);
  let chama_profile_text =
    setEnvironment() === 'development'
      ? 'Your Chama Profile'
      : 'View Chama Profile';

  return chama_profile_text;
};

module.exports = { setEnvironment, setChamaProfileText };
