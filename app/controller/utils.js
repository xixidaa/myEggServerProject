'use strict'
const svgCaptcha = require('svg-captcha')
const BaseController = require('./base')
const path = require('path')
const fse = require('fs-extra')

class UtilsController extends BaseController {
  async getBtnStatus() {
    const status = Math.random() > 0.9
    // const status = true
    this.success({
      status,
    })
  }

  async captcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
      noise: 3,
    })

    // 存储在session
    this.ctx.session.captcha = captcha.text
    this.ctx.response.type = 'image/svg+xml'
    this.ctx.body = captcha.data
  }
  // 邮箱验证码
  async sendCode() {
    const { ctx } = this
    const email = ctx.query.email
    const code = Math.random().toString().slice(2, 6)
    console.log('邮箱: ' + email + '验证码' + code)
    ctx.session.emailCode = code

    const subject = 'wn的验证码'
    const text = ''
    const html = `<h2>小王社区</h2><a href="http://www.baidu.com"><span>${code}</span></a>`

    const hasSend = await this.service.tools.sendMail(email, subject, text, html)

    if (hasSend) {
      this.message('发送成功')
    } else {
      this.error('发送失败')
    }
  }

  // 文件上传前校验文件是否存在
  async checkFile() {
    const { ctx } = this
    const { hash, ext } = ctx.request.body

    let uploaded = false // 默认没上传完
    let uploadedList = [] // 默认上传的分片列表为空
    const currFilePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    // public下存在该目录 => 已上传
    if (fse.existsSync(currFilePath)) {
      uploaded = true
    } else {
      uploadedList = await this.getUploadedList(path.resolve(this.config.UPLOAD_DIR, hash))
    }
    this.success({
      uploaded,
      uploadedList,
    })
  }
  // 获取文件已上传切片列表
  async getUploadedList(chunksPath) {
    return fse.existsSync(chunksPath)
      ? (await fse.readdir(chunksPath)).filter(name => name[0] !== '.') // 过滤掉一些隐藏文件
      : []
  }

  // 上传文件
  async uploadFile() {
    // public/hash/(hash + index)文件
    // 暂时将分片的数据放在public/hash/文件下,命名为hash + index
    const { ctx } = this
    if (Math.random() < 0.1) {
      ctx.status = 500
      return
    }
    const file = ctx.request.files[0]
    const { chunkName, hash } = ctx.request.body
    // 切片存放位置
    const chunksPath = path.resolve(this.config.UPLOAD_DIR, hash)

    if (!fse.existsSync(chunksPath)) {
      // 创建存放临时文件的目录
      await fse.mkdir(chunksPath)
    }
    // 将临时文件放到对应的文件夹
    await fse.move(file.filepath, `${chunksPath}/${chunkName}`)
    this.success('切片上传成功')
  }

  // 合并分片
  async requestMerge() {
    const { ctx } = this
    const { ext, hash, size } = ctx.request.body
    // 合并完成文件存放路径
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    // const chunksPath = path.resolve(this.config.UPLOAD_DIR, hash)

    const res = await this.ctx.service.tools.mergeFile(filePath, hash, size)
    console.log(res)
    // await fse.rmdirSync(chunksPath) // 合并后删除保存切片的目录
    this.success({
      url: `pulic/${hash}.${ext}`,
    })
  }
}

module.exports = UtilsController
