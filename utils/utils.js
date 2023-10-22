const ENV =
  typeof process.env.NODE_ENV !== 'undefined'
    ? `.env.${process.env.NODE_ENV}`
    : `.env`;

const checkEnvironment = () => {
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
  let chama_profile_text =
    checkEnvironment() === 'development'
      ? 'Your Chama Profile'
      : 'View Chama Profile';

  return chama_profile_text;
};

module.exports = { checkEnvironment, setChamaProfileText };
