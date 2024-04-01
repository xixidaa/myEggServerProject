'use strict'
const md5 = require('md5')
const HashSalt = ':wangning@666'
const BaseController = require('./base')
const jwt = require('jsonwebtoken')
const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  passwd: { type: 'string' },
  captcha: { type: 'string' },
}

class UserController extends BaseController {
  async login() {
    const { ctx, app } = this
    const { email, passwd, captcha, emailcode } = ctx.request.body

    // 检验验证码
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }

    // 检验邮箱验证码
    if (emailcode.toUpperCase() !== ctx.session.emailCode.toUpperCase()) {
      return this.error('邮箱验证码错误')
    }

    const user = await ctx.model.User.findOne({
      email,
      passwd: md5(passwd + HashSalt),
    })

    if (!user) {
      return this.error('用户名或密码错误')
    }

    // 登陆成功 把用户信息加密成token返回
    // token构成 第一块: header 第二块: payload承载信息 第三块: 签名 由一二部分加上secret通过某种加密方式形成
    const token = jwt.sign({
      _id: user._id,
      email,
    }, app.config.jwt.secret, {
      expiresIn: '10h',
    })

    this.success({ token, email, nickname: user.nickname })
  }
  async register() {
    const { ctx } = this
    try {
      // 校验传递的参数
      ctx.validate(createRule)
    } catch (error) {
      return this.error('参数校验失败', -1, error.errors)
    }

    const { email, passwd, nickname, captcha } = ctx.request.body

    // 检验验证码
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }


    // 校验邮箱是否重复
    if (await this.checkEmail(email)) {
      this.error('邮箱重复了')
    } else {
      const ret = await ctx.model.User.create({
        email,
        nickname,
        passwd: md5(passwd + HashSalt),
      })

      if (ret._id) {
        this.success('注册成功')
      }
    }
  }

  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email })
    return user
  }

  async verify() {
    // 检验用户是否存在
    this.success('验证成功')
  }

  async info() {
    const { ctx } = this
    // jwt中间件在state中添加email
    const { email } = ctx.state
    const user = await this.checkEmail(email)
    this.success(user)
  }

  async uploadUserAvatar() {
    const { ctx } = this
    const { userId } = ctx.state
    const { avatar } = ctx.request.body
    const res = await ctx.model.User.updateOne({ _id: userId }, { avatar })
    // todo 返回文件生成链接和返回base64有什么不同
    console.log(res)
    // const attachmentUrl = ``
    this.success('成功')
  }
}

module.exports = UserController
