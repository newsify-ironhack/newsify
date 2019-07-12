const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  owner: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Comment', commentSchema)
