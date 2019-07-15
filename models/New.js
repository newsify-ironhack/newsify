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
  description: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },
  author: {
    type: String,
  },
  likes: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    qty: {
        type: Number,
        default: 0
    }
  },
  comments: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    qty: {
        type: Number,
        default: 0
    }
  },
  location: {
    type: String
  },
  articleUrl: {
    type: String,
    require: true
  },
  articleDate: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('New', newSchema)
