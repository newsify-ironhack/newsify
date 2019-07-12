const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const newSchema = new Schema({
  owner: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },
  author: {
    type: String,
    required: true
  },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  location: {
    type: String
  },
  source: {
    id: {
      type: String
    },
    name: {
      type: String
    }
  },
  articleUrl: {
    type: String,
    require: true
  }
})

module.exports = mongoose.model('New', newSchema)
