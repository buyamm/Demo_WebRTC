const allUsers = {}

const socketService = io => {
  // Handle socket connection
  io.on('connection', socket => {
    console.log(`Someone connected to server and socket id is ${socket.id}`)
    socket.on('join-user', userEmail => {
      console.log(`User ${userEmail} has joined`)

      allUsers[userEmail] = { id: socket.id, userEmail }

      // inform for all user
      io.emit('joined', allUsers)
    })

    socket.on('offer', ({ from, to, offer }) => {
      console.log({ from, to, offer })
      io.to(allUsers[to].id).emit('offer', { from, to, offer })
    })

    socket.on('answer', ({ from, to, answer }) => {
      io.to(allUsers[from].id).emit('answer', { from, to, answer: answer })
    })

    socket.on('end-call-btn', ({ from, to }) => {
      io.to(allUsers[to].id).emit('end-call', { from, to })
    })

    socket.on('icecandidate', candidate => {
      console.log({ candidate })
      // broadcast to other peers
      socket.broadcast.emit('icecandidate', candidate)
    })

    socket.on('call-ended', caller => {
      const [from, to] = caller
      io.to(allUsers[from].id).emit('call-ended', caller)
      io.to(allUsers[to].id).emit('call-ended', caller)
      // delete allUsers[from];
    })

    socket.on('mute', ({ username, isMuted }) => {})

    socket.on('userDisconnected', username => {
      console.log(`${username} has disconnected`)
      // Xóa người dùng khỏi hệ thống
      for (let u in allUsers) {
        if (allUsers[u].username === username) {
          delete allUsers[u]
          break
        }
      }

      // inform for all user
      socket.broadcast.emit('userDisconnected', username)
    })
  })
}

export default socketService
