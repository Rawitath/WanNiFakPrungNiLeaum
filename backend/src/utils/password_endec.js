import bcrypt from 'bcrypt'

const makePassword = async (password, salt) => {
  const hash = await bcrypt.hash(password, salt);
  return new String(hash);
};

const checkPassword = async (password, password_hash) => {
  const result = await bcrypt.compare(password, password_hash);
  return result;
};

export {makePassword, checkPassword};
