import bcrypt from 'bcrypt';

const password = 'test1234';
const hash = '$2b$10$bzj9VHtKqTuah3kEqDgC4eEyqv7p0HDHS7L.UEBEZv1889YObizsi';

async function run() {
  const isMatch = await bcrypt.compare(password, hash);
  console.log(`Password matches hash?`, isMatch);
}

run().catch(console.error);
