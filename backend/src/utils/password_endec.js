import bcrypt, { hash } from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config();

const makePassword = async (password, salt = process.env.PASSWORD_ENDEC_SALT || 'saltSALT') => {
  const bSalt = await bcrypt.genSalt([...salt].map((char) => /^[a-z]$/.test(char) ? 1 : 2).reduce((acc, cur) => acc + cur));
  const hash = await bcrypt.hash(password, bSalt);
  return hash.toString();
};

const checkPassword = async (password, password_hash) => {
  const result = await bcrypt.compare(password, password_hash);
  return result;
};

export {makePassword, checkPassword};
