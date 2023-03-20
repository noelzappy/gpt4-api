const Bull = require('bull');
const { handleCompleted, handleFailure, handleStalled } = require('./handlers');
const config = require('../config/config');
const { User } = require('../models');

const messageQueue = new Bull('counting-messages', config.redisUrl);

async function handleMessagesCount({ data }) {
  let wordLength = 0;
  const { prompts = [], user } = data;

  prompts.forEach((prompt) => {
    if (prompt.role === 'user') {
      wordLength += prompt.content.split(' ').length;
    }
  });

  const userToUpdate = await User.findById(user.id);

  const newCredits = userToUpdate.credits - wordLength;

  Object.assign(userToUpdate, { credits: newCredits });

  await userToUpdate.save();

  // eslint-disable-next-line
  io.emit(`credits-${user.id}`, userToUpdate);
}

messageQueue.process(handleMessagesCount);

messageQueue.on('completed', handleCompleted);
messageQueue.on('failed', handleFailure);
messageQueue.on('stalled', handleStalled);

const messageWorker = async (data) => {
  return messageQueue.add(data, {
    removeOnComplete: true,
    attempts: 3,
  });
};

module.exports = messageWorker;
