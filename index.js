#!/usr/bin/env node

const http = require('http')
const server = http.createServer()

server.on('request', async function (request, response) {
  try {
    const buffers = []
    for await (const chunk of request) {
      buffers.push(chunk)
    }
    request.body = JSON.parse(Buffer.concat(buffers).toString())
  } catch (e) {
    console.error(e.message)
    request.body = {}
  }
  response.status = function (code) {
    this.statusCode = code
    return this
  }
  response.json = function (json) {
    if (!response.writableEnded) {
      this.writeHead(200, { 'Content-Type': 'application/json' })
      this.end(JSON.stringify(json, null, 2))
    }
    return this
  }
  response.status(200)
  return response.json({
    headers: request.headers,
    'connection.remoteAddress': request.connection.remoteAddress,
    'socket.remoteAddress': request.socket.remoteAddress,
    'connection.socket.remoteAddress': request.connection.socket?.remoteAddress
  })
})

const port = parseInt(process.env.TWIKOO_PORT) || 8080
const host = process.env.TWIKOO_LOCALHOST_ONLY === 'true' ? 'localhost' : '::'

server.listen(port, host, function () {
  console.log(`Twikoo function started on host ${host} port ${port}`)
})
