const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createMessage = {
  body: Joi.object().keys({
    chat: Joi.string().custom(objectId).required(),
    message: Joi.string().required(),
    parentMessage: Joi.string().custom(objectId),
    priorMessage: Joi.string().custom(objectId),
  }),
};

const getMessages = {
  query: Joi.object().keys({
    chat: Joi.string().custom(objectId).required(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const deleteMessage = {
  params: Joi.object().keys({
    messageId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createMessage,
  getMessages,
  deleteMessage,
};
