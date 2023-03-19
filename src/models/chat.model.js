const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const chatSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      default: 'General',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    systemMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
chatSchema.plugin(toJSON);
chatSchema.plugin(paginate);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
