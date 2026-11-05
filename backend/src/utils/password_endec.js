import bcrypt, { hash } from 'bcrypt'

const makePassword = async (password, salt) => {
  const bSalt = await bcrypt.genSalt([...salt].map((char) => /^[a-z]$/.test(char) ? char = 1 : char = 2).reduce((acc, cur) => acc + cur));
  const hash = await bcrypt.hash(password, bSalt);
  return hash.toString();
};

const checkPassword = async (password, password_hash) => {
  const result = await bcrypt.compare(password, password_hash);
  return result;
};

export {makePassword, checkPassword};
