import bcrypt, { hash } from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config();

const makePassword = async (password, salt = process.env.PASSWORD_ENDEC_SALT || 'saltSALT') => {
  const calculatedRounds = [...salt].map((char) => /^[a-z]$/.test(char) ? 1 : 2).reduce((acc, cur) => acc + cur, 0);
  const rounds = Math.min(calculatedRounds, 12); // บังคับไม่ให้เกิน 12 รอบ

  const bSalt = await bcrypt.genSalt(rounds);
  const hash = await bcrypt.hash(password, bSalt);
  return hash.toString();
};

const checkPassword = async (password, password_hash) => {
  const result = await bcrypt.compare(password, password_hash);
  return result;
};

export {makePassword, checkPassword};
