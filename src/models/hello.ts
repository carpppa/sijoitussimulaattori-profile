import * as Joi from 'joi';

const helloSchema = Joi.object({
  name: Joi.object({
    first: Joi.string().required(),
    last: Joi.string().optional(),
  }).required(),
});

export { helloSchema };
