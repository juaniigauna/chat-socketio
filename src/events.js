let { v4: uuid } = require('uuid')
const usersOnline = []
const messages = []
function getUsername(socketId) {
    let [user] = usersOnline.filter(user => user.socketId === socketId)
    return user.username
}
module.exports = (io) => {
    io.on('connection', socket => {
        const user = {
            socketId: socket.id,
            username: null
        }
        usersOnline.push(user)
        io.sockets.emit('user-connected', user)
        socket.emit('pass-users', usersOnline)
        
        socket.on('set-username', data => {
            usersOnline.filter(user => { 
                if (user.socketId === socket.id) {
                    user.username = data.username
                    socket.broadcast.emit('user-setted-username', user)
                }
            })
        })
        
        socket.on('new-message', data => {
            let messageId = uuid()
            const message = {
                id: messageId,
                socketId: socket.id,
                username: getUsername(socket.id),
                text: data.text
            }
            messages.push(message)
            io.sockets.emit('new-message', message)
        })
    
        socket.on('greet', data => {
            io.to(data.toSocketId).emit('new-greet', {
                fromSocketId: socket.id,
                username: getUsername(socket.id)
            })
        })
    
        socket.on('disconnect', () => {
            io.sockets.emit('user-disconnected', socket.id)
            usersOnline.forEach((data, index) => {
                if (data.socketId === socket.id) usersOnline.splice(index, 1)
            })
        })
    })
}