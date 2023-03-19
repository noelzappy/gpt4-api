const { Configuration, OpenAIApi } = require('openai');

const config = require('./config');

const OPENAI_MODEL = 'gpt-4';

const configuration = new Configuration({
  apiKey: config.openai.apiKey,
  organization: config.openai.orgId,
});

const openai = new OpenAIApi(configuration);

const sendMessage = async (prompt) => {
  const { data } = await openai.createChatCompletion({
    model: OPENAI_MODEL,
    messages: prompt,
  });

  const { message: mesageObj } = data.choices[0];

  return mesageObj;
};

module.exports = { sendMessage };
