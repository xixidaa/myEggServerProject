'use strict'
const BaseController = require('./base')

class ArticleController extends BaseController {
  // 用户=>文章 一对多
  // 详情
  async detail() {
    const { ctx } = this
    const { id } = ctx.params
    // $inc => 自增1
    const article = await ctx.model.Article.findOneAndUpdate({ _id: id }, { $inc: { views: 1 } }, { new: true }).populate('author')
    this.success(article)
  }
  // 创建文章
  async create() {
    const { ctx } = this
    const { userId } = ctx.state
    const { articleTitle, content, compileMarkdown, type = 'md' } = ctx.request.body
    // console.log(content, compileMarkdown)
    let title = ''
    if (type === 'quill') {
      title = articleTitle
    } else {
      title = content.split('\n').find(v => {
        return v.indexOf('# ') === 0
      })
    }

    const obj = {
      title: title.replace('# ', ''),
      article: content,
      article_html: compileMarkdown,
      author: userId,
    }

    const ret = await ctx.model.Article.create(obj)

    this.success({
      message: '创建成功',
      id: ret._id,
    })
  }

  async index() {
    const { ctx } = this
    const articles = await ctx.model.Article.find().populate('author').sort({ createdAt: -1 })
    // const articleItem = { views: 1, like: 0, dislike: 0, _id: '5ff6c0b9bc4f6b4f84804a90', title: '穿越火线 枪战王者', article_html: '<h1 id="穿越火线-枪战王者">穿越火线 枪战王者</h1>\n<p>cf</p>\n', author: { avatar: 'https://sf6-scmcdn2-tos.pstatp.com/xitu_juejin_web/img/logo.a7995ad.svg', _id: '5fe2da28066ca53ba0cd845f', email: '575583692@qq.com', nickname: '嘻嘻哒啊', createdAt: '2020-12-23T05:48:24.620Z', updatedAt: '2020-12-23T05:48:24.620Z' }, createdAt: '2021-01-07T08:05:13.394Z', updatedAt: '2021-01-07T08:05:13.394Z', __v: 0 }
    // const articleItem1 = { views: 12, like: 0, dislike: 0, _id: '5ff6c0b9bc4f6b4f84804a90', title: '穿越火线 枪战王者', article_html: '<h1 id="穿越火线-枪战王者">穿越火线 枪战王者</h1>\n<p>cf</p>\n', author: { avatar: 'https://sf6-scmcdn2-tos.pstatp.com/xitu_juejin_web/img/logo.a7995ad.svg', _id: '5fe2da28066ca53ba0cd845f', email: '575583692@qq.com', nickname: '嘻嘻哒啊', createdAt: '2020-12-23T05:48:24.620Z', updatedAt: '2020-12-23T05:48:24.620Z' }, createdAt: '2021-01-07T08:05:13.394Z', updatedAt: '2021-01-07T08:05:13.394Z', __v: 0 }
    // const articles = new Array(10).fill(articleItem)
    // const article1 = new Array(10).fill(articleItem1)
    // const article = [ ...articles, ...article1 ]
    this.success({
      message: '查询成功',
      list: articles,
    })
  }

  //
}

module.exports = ArticleController
