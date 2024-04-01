'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  const jwtMiddleware = app.middleware.jwt({ app })
  router.get('/', controller.home.index)
  // 验证码服务
  router.get('/captcha', controller.utils.captcha)
  // 邮箱验证码
  router.get('/sendCode', controller.utils.sendCode)
  // 轮询功能
  router.get('/getBtnStatus', controller.utils.getBtnStatus)
  // 上传文件服务
  router.post('/uploadFile', controller.utils.uploadFile)
  // 分片合并请求
  router.post('/requestMerge', controller.utils.requestMerge)
  // 上传前获取文件是否存在hash,以及上传了多少分片数据
  router.post('/checkFile', controller.utils.checkFile)

  router.group({ name: 'user', prefix: '/user',
  }, router => {
    const { register, login, verify, info, uploadUserAvatar } = controller.user

    router.post('/register', register)
    router.post('/login', login)
    router.get('/verify', verify)
    // 插入token检验中间件
    router.get('/info', jwtMiddleware, info)
    router.post('/uploadUserAvatar', jwtMiddleware, uploadUserAvatar)
    router.get('/detail', jwtMiddleware, info)
  })

  router.group({ name: 'article', prefix: '/article' }, router => {
    const { create, index, detail } = controller.article

    router.post('/create', jwtMiddleware, create)
    router.get('/', index)
    router.get('/detail/:id', detail)
  })
}
