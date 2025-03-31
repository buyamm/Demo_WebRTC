import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import viewRoutes from './services/socketService.js'
import socketService from './services/socketService.js'

const app = express()
const server = createServer(app) //Cái hay ở đây là app (Express) có thể hoạt động như một request handler cho server HTTP.
const io = new Server(server)

const __dirname = dirname(fileURLToPath(import.meta.url))

app.use(express.static('public'))
app.use('/', viewRoutes)

// Kết nối WebRTC qua Socket.IO
socketService(io)

server.listen(9000, () => {
  console.log('Server is listening on port 9000')
})
