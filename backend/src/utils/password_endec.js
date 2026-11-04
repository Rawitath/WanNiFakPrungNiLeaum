import crypto from 'crypto';

const makePassword = (password, salt) => {
  const randomSalt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(password + (salt ? salt + randomSalt : randomSalt)).digest('hex');
  return new String(hash);
};

export default makePassword;
