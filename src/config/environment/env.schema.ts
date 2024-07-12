import * as Joi from 'joi';

export default Joi.object({
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  HASH_ROUNDS: Joi.number().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_SECURE: Joi.boolean().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  SMTP_DEFAULT_FROM: Joi.string().required(),
  SMTP_CONTACT_US_EMAIL: Joi.string().required(),
  RATE_LIMIT_EMAIL_TTL: Joi.number().required(),
  RATE_LIMIT_EMAIL_LIMIT: Joi.number().required(),
  RATE_LIMIT_DEFAULT_TTL: Joi.number().required(),
  RATE_LIMIT_DEFAULT_LIMIT: Joi.number().required(),
  CLOUDINARY_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  CLOUDINARY_FOLDER: Joi.string().required(),
});
