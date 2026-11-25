import bcrypt from 'bcrypt';

async function hashPassword(plainPassword) {
  // The 'saltRounds' determines the cost factor. 
  // 10-12 is generally recommended for a good balance of security/speed.
  const saltRounds = 10;
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  return hash;
}

// Usage Example
const hashedPassword = await hashPassword('12345');


console.log(hashedPassword);
