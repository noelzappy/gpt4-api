const { sendMessage } = require('../config/openai');
const { messageService } = require('../services');
const logger = require('../config/logger');
const { messageWorker } = require('../workers');

const DEFAULT_SYSTEM_MESSAGE = `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nCurrent date: ${new Date().toISOString()}`;

module.exports = (socket) => {
  const onJoinChat = async (data) => {
    socket.join(data.chatId);
    socket.emit('loadingMessages', {});

    const messages = await messageService.getLastMessages(data.chatId);

    socket.emit(
      'joinedChat',
      messages.map((message) => message.toJSON())
    );

    socket.emit('stopLoadingMessages', {});
  };

  const onLeaveChat = async (data) => {
    socket.leave(data.chatId);
    // broadcast to all users in the room
    socket.to(data.chatId).emit('leaveChat', {
      user: socket.user,
    });
    socket.disconnect();
  };

  const onMessage = async (data) => {
    try {
      const { user } = socket;
      const { chat, message, parentMessage, priorMessage, priorContent, parentContent, systemMessage } = data;

      logger.info(`Socket: ${user.name} sent message: ${message}`);

      const userMessage = {
        chat,
        message,
        parentMessage,
        priorMessage,
        user: user.id,
        sender: 'user',
      };

      const sentMessage = await messageService.createMessage(userMessage);

      socket.to(data.chat).emit('message', sentMessage.toJSON());

      socket.to(data.chat).emit('typing', {});

      let wordLength = 0;

      const prompt = [
        {
          role: 'system',
          content: systemMessage || DEFAULT_SYSTEM_MESSAGE,
        },
      ];

      if (parentContent) {
        wordLength += parentContent.split(' ').length;
        prompt.push({ role: 'user', content: parentContent });
      }
      if (priorContent) {
        wordLength += priorContent.split(' ').length;
        prompt.push({ role: 'user', content: priorContent });
      }

      wordLength += message.split(' ').length;
      prompt.push({ role: 'user', content: message });

      // const handleStream = (textObj) => {
      //   if (!textObj.content) {
      //     socket.to(data.chat).emit('stopTyping', {});
      //     return;
      //   }
      //   botIncomingMessage = `${botIncomingMessage} ${textObj.content}`;

      //   socket.to(data.chat).emit('typing', { text: textObj.content });
      // };

      if (wordLength > user.credits) {
        socket.to(data.chat).emit('appError', { error: "You don't have enough credits to send this message" });
        return;
      }

      messageWorker({ prompts: prompt, user });

      const result = await sendMessage(prompt);

      const botMessage = {
        chat,
        message: result.content,
        parentMessage,
        priorMessage,
        user: user.id,
        sender: 'bot',
      };

      const msg = await messageService.createMessage(botMessage);

      socket.to(data.chat).emit('message', msg.toJSON());
      socket.to(data.chat).emit('stopTyping', {});
    } catch (e) {
      const errorMessage = e.response?.data?.error?.messages || e.message || e;

      logger.error(e);

      socket.to(data.chat).emit('appError', { error: errorMessage });
    }
  };

  socket.on('joinChat', onJoinChat);
  socket.on('leaveChat', onLeaveChat);
  socket.on('message', onMessage);
};
