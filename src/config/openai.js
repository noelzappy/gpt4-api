const { Configuration, OpenAIApi } = require('openai');

const config = require('./config');

const OPENAI_MODEL = 'gpt-4';

const configuration = new Configuration({
  apiKey: config.openai.apiKey,
  organization: config.openai.orgId,
});

const openai = new OpenAIApi(configuration);

const sendMessage = async (prompt) => {
  const res = await openai.createChatCompletion({
    model: OPENAI_MODEL,
    messages: prompt,
  });

  // res.data.on('data', (data) => {
  //   const lines = data
  //     .toString()
  //     .split('\n')
  //     .filter((line) => line.trim() !== '');

  //   /* eslint-disable no-restricted-syntax */
  //   for (const line of lines) {
  //     const message = line.replace(/^data: /, '');
  //     if (message === '[DONE]') {
  //       return '[DONE]';
  //     }
  //     try {
  //       const parsed = JSON.parse(message);

  //       const textObj = parsed.choices[0].delta;
  //       handleStream(textObj);
  //       return textObj;
  //     } catch (error) {
  //       handleStream({});
  //     }
  //   }
  //   /* eslint-enable no-restricted-syntax */
  // });

  const { message: mesageObj } = res.data.choices[0];

  return mesageObj;
};

module.exports = { sendMessage };
