const users = []

const addUser = ({id , username , room}) => {
	username = username.trim().toLowerCase()
	room = room.trim().toLowerCase()

	if(!username || !room) {
		return {
			'error' : 'username and root are required!'
		}
	}

	const existingUser = users.find((user) => {
		return user.room ===  room && user.username === username
	})

	if(existingUser) {
		return {
			'error' : 'Username is in use!'
		}
	}

	const user = {id , username , room}
	users.push(user)
	return {user}
}

const removeUser = (id) => {
	const index = users.findIndex((user) => {
		return user.id === id
	})

	if(index !== -1) {
		return users.splice(index , 1)[0]
	}
}

const getUser = (id) => {
	const user = users.find((user) => {
		return user.id ===  id
	})

	return user
}

const getUserInRoom = (room) => {
	room = room.trim().toLowerCase()
	const roomUser = users.filter((user) => {
		return user.room === room
	})

	return roomUser
}

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUserInRoom
}