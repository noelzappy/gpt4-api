const chatSocket = require('./chat.socket');
// const logger = require('../config/logger');

const onConnection = (socket) => {
  // logger.info(`Socket: ${socket.user.name} connected`);

  chatSocket(socket);
};

module.exports = {
  onConnection,
};
