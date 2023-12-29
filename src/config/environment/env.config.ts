import { registerAs } from '@nestjs/config';

export default registerAs('env', () => ({
  port: parseInt(process.env.PORT, 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  hash: {
    rounds: parseInt(process.env.HASH_ROUNDS, 10),
  },
}));
