import { registerAs } from '@nestjs/config';

export default registerAs('env', () => ({
  rateLimit: {
    email: {
      ttl: parseInt(process.env.RATE_LIMIT_EMAIL_TTL, 10),
      limit: parseInt(process.env.RATE_LIMIT_EMAIL_LIMIT, 10),
    },
  },
  port: parseInt(process.env.PORT, 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  hash: {
    rounds: parseInt(process.env.HASH_ROUNDS, 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    defaults: {
      from: process.env.SMTP_DEFAULT_FROM,
    },
    contactUsEmail: process.env.SMTP_CONTACT_US_EMAIL,
  },
}));
