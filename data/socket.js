import http from 'http'
import SocketIO from 'socket.io'

let socketControl = {}
socketControl.broadcast = (channel, message) => {
    if (!socketControl.io) return console.log('Not ready to broadcast')
    socketControl.io.sockets.emit(channel, message)
}

export { socketControl }
export default function() {
    const server = http.createServer(this.nuxt.renderer.app)
    const io = SocketIO(server)
    socketControl.io = io

    this.nuxt.server.listen = (port, host) =>
        new Promise(resolve =>
            server.listen(port || 3000, host || 'localhost', resolve)
        )
    this.nuxt.hook('close', () => new Promise(server.close))

    io.on('connection', socket => {
        let types = ['game', 'waiter']
        for (let type of types)
            socket.on(`${type}-update`, function(data) {
                let { id } = data
                console.log(`${type} ${id} updated`)
                if (!id) socket.broadcast.emit(`${type}-updated`, {})
                else socket.broadcast.emit(`${type}-updated-${id}`, {})
            })
    })
}
