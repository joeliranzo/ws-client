import { Manager, Socket } from "socket.io-client";

let socket:Socket

export const connectToServer = (token:string) => {
	// http://localhost:4000/socket.io/socket.io.js

	const manager = new Manager('http://localhost:4000/socket.io/socket.io.js', {
		extraHeaders: {
			authentication: token
		}
	})

	socket?.removeAllListeners()
	socket = manager.socket('/')

	addListeners()
}

const addListeners = () => {
	const messageForm = document.querySelector<HTMLFormElement>("#message-form")
	const messageInput = document.querySelector<HTMLInputElement>("#message-input")
	const clientsUl = document.querySelector<HTMLUListElement>("#clients-ul")
	const messagesUl = document.querySelector<HTMLUListElement>("#messages-ul")
	const serverStatusLabel = document.querySelector<HTMLSpanElement>("#server-status")

	if (!serverStatusLabel) {
		throw new ReferenceError("server status is null");
	}
	if (!clientsUl) {
		throw new ReferenceError("clients ul is null");
	}
	if (!messageInput) {
		throw new ReferenceError("message input is null");
	}

	socket.on('connect', () => {
		serverStatusLabel.innerHTML = 'Online'
	})
	socket.on('disconnect', () => {
		serverStatusLabel.innerHTML = 'Offline'
	})

	socket.on('clients-updated', (clients: string[]) => {
		let clientsHtml = ''
		clients.forEach(clientId => {
			clientsHtml += `
			<li>${clientId}</li>
			`
		})
		clientsUl.innerHTML = clientsHtml
	})

	messageForm?.addEventListener('submit', (event) => {
		event.preventDefault()

		if (messageInput.value.trim().length <= 0) { return }
		socket.emit('message-from-client', {id: 'YO!', message: messageInput?.value})
		messageInput.value = ''
	})

	socket.on('message-from-server', (payload: {fullName:string, message:string}) => {
		const newMessage = `
			<li>
				<strong>${payload.fullName}</strong>	
				<span>${payload.message}</span>	
			</li>
		`
		const li = document.createElement('li')
		li.innerHTML = newMessage
		messagesUl?.append(li)
	})
}