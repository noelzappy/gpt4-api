const Joi = require('joi');

const createPayment = {
  body: Joi.object().keys({
    paymentReference: Joi.string().required(),
  }),
};

module.exports = {
  createPayment,
};
