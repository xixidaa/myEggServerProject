'use strict'
const { Service } = require('egg')
const nodeMailer = require('nodemailer')
const path = require('path')
const fse = require('fs-extra')
const userEmail = '17862511099@163.com'
const transporter = nodeMailer.createTransport({
  service: '163',
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'LJHMIQYIUUFYXMKA', // 授权码 不是邮箱密码
  },
})

// service主要负责通用逻辑
class ToolService extends Service {
  async sendMail(email, subject, text, html) {
    const mailOptions = {
      from: userEmail,
      cc: userEmail,
      to: email,
      subject,
      text,
      html,
    }
    try {
      await transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async mergeFile(filePath, fileHash, size) {
    const chunkDir = path.resolve(this.config.UPLOAD_DIR, fileHash)
    // 读取临时文件中的文件块
    let chunks = await fse.readdir(chunkDir)
    // 对文件块进行排序
    chunks.sort((a, b) => {
      return a.split('-')[1] - b.split('-')[1]
    })
    // 拼接成绝对路径
    chunks = chunks.map(chunkpath => {
      return path.resolve(chunkDir, chunkpath)
    })
    const ret = await this.mergeChunks(chunks, filePath, size)
    console.log(ret)
  }

  async mergeChunks(chunks, dest, size) {
    const pipStream = (filePath, writeStream) => new Promise(resolve => {
      const readStream = fse.createReadStream(filePath)
      readStream.on('end', () => {
        fse.unlink(filePath)
        resolve(1)
      })
      readStream.pipe(writeStream)
    })

    await Promise.all(
      chunks.map((chunkPath, index) => {
        return pipStream(chunkPath, fse.createWriteStream(dest, {
          start: index * size,
          end: (index + 1) * size,
        }))
      })
    )
  }
}

module.exports = ToolService
