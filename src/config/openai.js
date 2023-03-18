const { Configuration, OpenAIApi } = require('openai');

const config = require('./config');

const configuration = new Configuration({
  apiKey: config.openai.apiKey,
  organization: config.openai.orgId,
});

const openai = new OpenAIApi(configuration);
