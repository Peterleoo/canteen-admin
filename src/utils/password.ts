import bcrypt from 'bcryptjs';

/**
 * 密码工具类，用于密码的哈希和验证
 * 注意：在生产环境中，密码哈希处理应该在后端进行
 */

/**
 * 生成密码哈希值
 * @param password 明文密码
 * @returns 哈希后的密码
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

/**
 * 验证密码是否匹配
 * @param password 明文密码
 * @param hash 哈希值
 * @returns 是否匹配
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * 生成随机密码
 * @param length 密码长度
 * @returns 随机密码
 */
export const generateRandomPassword = (length: number = 8): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};
