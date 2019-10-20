const mongoose = require("mongoose")

module.exports = mongoose.model(
  "library",
  new mongoose.Schema({
    title : String,
    comments: [String]
  })
)
