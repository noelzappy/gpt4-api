const logger = require('../config/logger');

const handleCompleted = (job) => {
  logger.info(`Job in ${job.queue.name} completed for: ${job.id}`);
  job.remove();
};

const handleFailure = (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    logger.info(`Job failures above threshold in ${job.queue.name} for: ${job.id}`, err);
    return null;
  }

  logger.info(
    `Job in ${job.queue.name} failed for: ${job.id} with ${err.message}. ${
      job.opts.attempts - job.attemptsMade
    } attempts left`
  );
};

const handleStalled = (job) => {
  logger.info(`Job in ${job.queue.name} stalled for: ${job.id}`);
};

module.exports = {
  handleCompleted,
  handleFailure,
  handleStalled,
};
