'use strict'
const fs = require('fs')

const readSteam = fs.createReadStream('./F12.json')

const reqData = []
let size = 0

readSteam.on('data', data => {
  reqData.push(data)
  size = data.length
})


readSteam.on('close', () => {
  const data = Buffer.concat(reqData, size).toString()
  console.log(JSON.parse(data))
})
