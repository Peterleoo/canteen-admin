import bcrypt from 'bcryptjs';

// 生成示例密码的哈希值
const passwords = ['user123', 'password456', 'test789', 'demo123', 'admin456'];

async function generateHashes() {
  console.log('生成密码哈希值：');
  console.log('==================');
  
  for (const password of passwords) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`密码: ${password}`);
    console.log(`哈希: ${hash}`);
    console.log('------------------');
  }
}

generateHashes();
