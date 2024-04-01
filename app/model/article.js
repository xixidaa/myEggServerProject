'use strict'
module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const ArticleSchema = new Schema({
    title: { type: String, required: true },
    article: { type: String, required: true, select: false },
    article_html: { type: String, required: true },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    views: { type: Number, required: false, default: 1 },
    like: { type: Number, required: false, default: 0 }, // 点赞数
    dislike: { type: Number, required: false, default: 0 },
    _v: { type: Number, select: false },
  }, { timestamps: true })

  return mongoose.model('Article', ArticleSchema)
}
