const { sendMessage } = require('../config/openai');
const { messageService } = require('../services');

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
      const prompt = [
        {
          role: 'system',
          content: systemMessage || DEFAULT_SYSTEM_MESSAGE,
        },
      ];

      if (parentContent) {
        prompt.push({ role: 'user', content: parentContent });
      }
      if (priorContent) {
        prompt.push({ role: 'user', content: priorContent });
      }

      prompt.push({ role: 'user', content: message });

      const result = await sendMessage(prompt);

      const botMessage = {
        chat,
        message: result.content,
        parentMessage,
        priorMessage,
        user: user.id,
      };

      const msg = await messageService.createMessage(botMessage);

      socket.to(data.chat).emit('message', msg.toJSON());
      socket.to(data.chat).emit('stopTyping', {});
    } catch (e) {
      socket.to(data.chat).emit('appError', { message: 'Error', sender: 'bot' });
    }
  };

  socket.on('joinChat', onJoinChat);
  socket.on('leaveChat', onLeaveChat);
  socket.on('message', onMessage);
};
