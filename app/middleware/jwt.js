/* 解析token中间件 也可以适应egg-jwt */
'use strict'
const jwt = require('jsonwebtoken')
module.exports = ({ app }) => {
  return async function verify(ctx, next) {
    if (!ctx.request.header.authorization) {
      ctx.body = {
        code: -666,
        message: '用户未登录',
      }
      return
    }

    const token = ctx.request.header.authorization.replace('Bearer ', '')

    try {
      const res = await jwt.verify(token, app.config.jwt.secret)
      ctx.state.email = res.email
      ctx.state.userId = res._id
      await next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        ctx.body = {
          code: -666,
          message: '登录过期了',
        }
      } else {
        console.log(error, '什么错误')
        ctx.body = {
          code: -1,
          message: '用户信息出错',
        }
      }
    }
  }
}
