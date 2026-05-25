import { io, Socket, ManagerOptions, SocketOptions } from "socket.io-client"

type SocketConnectOptions = Partial<ManagerOptions & SocketOptions>

let socket: Socket | null = null
let currentUrl: string | null = null
let currentToken: string | null = null

/**
 * Trả về socket đã kết nối với auth token.
 * Nếu URL hoặc token thay đổi, ngắt kết nối cũ và tạo mới.
 */
export function getSocket(
  url: string,
  options: SocketConnectOptions = {}
): Socket {
  const incomingToken = (options.extraHeaders as Record<string, string> | undefined)?.auth ?? null

  // Tái sử dụng socket nếu URL và token không đổi
  if (socket && currentUrl === url && currentToken === incomingToken) {
    return socket
  }

  if (socket) {
    socket.disconnect()
    socket = null
  }

  // Dùng polling trước để extraHeaders được gửi qua HTTP handshake
  // (browser không cho phép set custom headers trên raw WebSocket)
  // Sau khi handshake thành công, socket.io tự nâng cấp lên websocket
  socket = io(url, {
    transports: ["polling", "websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    ...options,
  })

  currentUrl = url
  currentToken = incomingToken

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
    currentUrl = null
    currentToken = null
  }
}
