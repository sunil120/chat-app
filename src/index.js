const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const { generateMessage , generateLocationMessage } = require('./utils/message')
const { addUser , removeUser , getUser , getUserInRoom} = require('./utils/users')
const app = express()
const publicDirectoryPath  = path.join(__dirname, '../public')
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(publicDirectoryPath))

app.get('/' , () => {
	app.render('index')
})

io.on('connection' , (socket) => {
	console.log("New websocket connection")

	socket.on('join' , ({ username , room } , callback) => {

		const {error , user} = addUser({id:socket.id ,username, room })

		if(error) {
			return callback(error)
		}

		socket.join(user.room)
		socket.emit('message' , generateMessage("Admin","Welcome"))
		socket.broadcast.to(user.room).emit('message', generateMessage("Admin",`${user.username} has joined!`))
		io.to(user.room).emit('roomData' , {
			room : user.room,
			users: getUserInRoom(user.room)
		})
		callback()
	})

	
	socket.on("sendMessage" , (message , callback) => {
		const user = getUser(socket.id)
		io.to(user.room).emit('message',generateMessage(user.username , message))
		callback('Delivered')
	})

	socket.on('disconnect' , () => {
		const user = removeUser(socket.id)

		if(user) {
			io.to(user.room).emit('message', generateMessage("Admin",`${user.username} has left!`))
			io.to(user.room).emit('roomData' , {
				room : user.room,
				users: getUserInRoom(user.room)
			})
		}
	})

	socket.on('sendLocation', (coords, callback) => {
		const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username , `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback("Location Shared")
    })
})



const port = process.env.PORT || 3000
server.listen(port , () => {
	console.log('Server is running on port ', port)
})