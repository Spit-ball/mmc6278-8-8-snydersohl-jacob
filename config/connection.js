const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mongo_blog'

mongoose.connect(MONGODB_URI)

module.exports = {connection: mongoose.connection, MONGODB_URI}