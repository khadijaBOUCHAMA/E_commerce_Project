import UserModel from "../models/mysql/user.model.js";
import jwt from 'jsonwebtoken';

const genertedRefreshToken = async (userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.SECRET_KEY_REFRESH_TOKEN,
    { expiresIn: '7d' }
  );

  await UserModel.update(
    { refresh_token: token },
    { where: { id: userId } }
  );

  return token;
};

export default genertedRefreshToken;
