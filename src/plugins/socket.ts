// import { io, Socket } from 'socket.io-client'

// let socket: Socket | null = null

// export const connectSocket = (): Socket => {
//   if (!socket || !socket.connected) {
//     socket = io('http://localhost:3000')
//   }
//   return socket
// }

// export const disconnectSocket = (): void => {
//   if (socket) {
//     socket.disconnect()
//     socket = null
//   }
// }

// export const getSocket = (): Socket | null => {
//   return socket
// }

// // Export default để tương thích với code hiện tại
// export default {
//   connect: connectSocket,
//   disconnect: disconnectSocket,
//   get: getSocket,
// }
