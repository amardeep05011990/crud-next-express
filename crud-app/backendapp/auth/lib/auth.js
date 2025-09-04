const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secretapiamar@12345";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refress-accessss-secretapiamar@12345";
const ACCESS_TTL = process.env.ACCESS_TOKEN_EXPIRES_IN || '1m';
const REFRESH_TTL = process.env.REFRESH_TOKEN_EXPIRES_IN || '1d';

async function hashPassword(password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signAccess(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}
function signRefresh(payload) {
  // include a token id to allow revocation
  const tokenId = crypto.randomBytes(16).toString('hex');
  return { token: jwt.sign({ ...payload, tid: tokenId }, REFRESH_SECRET, { expiresIn: REFRESH_TTL }), tid: tokenId };
}

// function signRefresh(payload) {
//   const tokenId = crypto.randomBytes(16).toString('hex'); // 🔹 New tid every time
//   return {
//     token: jwt.sign({ ...payload, tid: tokenId }, REFRESH_SECRET, { expiresIn: REFRESH_TTL }),
//     tid: tokenId
//   };
// }

function verifyAccess(token) {
  return jwt.verify(token, ACCESS_SECRET);
}
function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = { hashPassword, verifyPassword, signAccess, signRefresh, verifyAccess, verifyRefresh };
