/* eslint-disable new-cap */
const jsSHA = require('jssha');

// SALT
const SALT = process.env.MY_ENV_VAR;

// Hashing function getHash
module.exports = (input) => {
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  const unhashedString = `${input}-${SALT}`;
  shaObj.update(unhashedString);
  return shaObj.getHash('HEX');
};



