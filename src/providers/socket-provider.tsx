"use client"

import { getSocket, disconnectSocket } from "@/src/lib/socket"
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { Socket } from "socket.io-client"

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
  isTokenLoading: boolean
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  isTokenLoading: true,
})

interface SocketAuth {
  staff_id: string | number
  user_full_name: string
}

interface SocketProviderProps {
  url: string | null | undefined
  auth?: SocketAuth | null
  dbName: string | null | undefined
  children: React.ReactNode
}

export function SocketProvider({ url, auth,dbName, children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isTokenLoading, setIsTokenLoading] = useState(true)
  
  const hasFetched = useRef(false)

  // -------------------------------------------------------------------------
  // 1. Fetch token → tạo socket
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (
      hasFetched.current ||
      !url ||
      !auth?.staff_id ||
      !auth?.user_full_name ||
      !dbName
    )
      return

    hasFetched.current = true

    const initSocket = async () => {
      setIsTokenLoading(true)
      try {
        const body = {
          user_id: auth.staff_id,
          db_name: dbName,
          user_name: auth.user_full_name,
        }

        const res = await fetch(`${url}/add-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },

          body: JSON.stringify(body),
        })

        const result = await res.json()
        const token: string | undefined = result?.token

        if (!token) {
          console.warn("[SocketProvider] Không nhận được token từ server")
          return
        }

        const s = getSocket(url, { extraHeaders: { auth: token } })
        setSocket(s)
      } catch (err) {
        console.error("[SocketProvider] Lỗi khởi tạo socket:", err)
      } finally {
        setIsTokenLoading(false)
      }
    }

    initSocket()

    return () => {
      disconnectSocket()
      setSocket(null)
      setIsConnected(false)
      hasFetched.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, auth?.staff_id, auth?.user_full_name, dbName])

  // -------------------------------------------------------------------------
  // 2. Gắn sự kiện khi socket đã sẵn sàng
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!socket) return

    const onConnect = () => {
      console.log("🔌 Socket connected:", socket.id)
      setIsConnected(true)
      socket.emit("connectedData", {
        user_id: auth?.staff_id,
        db_name: dbName,
        user_name: auth?.user_full_name,
      })
    }

    const onDisconnect = () => {
      console.log("❌ Socket disconnected")
      setIsConnected(false)
    }

    const onConnectError = (err: Error & { data?: unknown }) => {
      console.error("Socket connection error:", err?.message, err?.data)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onConnectError)

    if (socket.connected) onConnect()

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onConnectError)
    }
  }, [socket, auth?.staff_id, auth?.user_full_name, dbName])

  // -------------------------------------------------------------------------
  // 3. Render
  // -------------------------------------------------------------------------
  return (
    <SocketContext.Provider value={{ socket, isConnected, isTokenLoading }}>
      {children}
    </SocketContext.Provider>
  )
}


// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSocket() {
  return useContext(SocketContext)
}
