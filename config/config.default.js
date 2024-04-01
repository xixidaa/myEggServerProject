/* eslint valid-jsdoc: "off" */
'use strict'
const path = require('path')
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {}

  config.bodyParser = {
    jsonLimit: '1mb',
    formLimit: '1mb',
  }

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1607665337736_9516'

  // add your middleware config here
  config.middleware = []

  // 设置文件上传
  config.multipart = {
    mode: 'file',
    whitelist: () => true,
  }
  // 配置默认上传路径
  config.UPLOAD_DIR = path.resolve(__dirname, '..', 'app/public')

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  }

  return {
    ...config,
    ...userConfig,
    security: {
      csrf: {
        enable: false,
      },
    },
    mongoose: {
      client: {
        url: 'mongodb://127.0.0.1/wnhub',
        options: {},
      },
    },
    jwt: {
      secret: '@wangning:1a2s3d',
    },
  }
}
