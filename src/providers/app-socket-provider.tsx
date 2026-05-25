"use client"

import { useGetInfoSettings } from "@/src/services"
import { useState } from "react"
import { SocketProvider } from "./socket-provider"

interface BranchData {
  id: number
  name: string
  address: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

/**
 * Đọc thông tin branch từ localStorage (key "branch"),
 * fetch settings để lấy socket URL + db_name,
 * rồi khởi tạo kết nối socket cho toàn app.
 */
export function AppSocketProvider({ children }: { children: React.ReactNode }) {
  const { data: settingsData } = useGetInfoSettings()

  // Dùng lazy initializer để đọc localStorage đồng bộ ngay lần render đầu,
  // tránh setState bên trong useEffect gây cascading renders.
  const [branch] = useState<BranchData | null>(() => {
    if (typeof window === "undefined") return null
    try {
      const raw = localStorage.getItem("branch")
      return raw ? JSON.parse(raw) : null
    } catch {
      console.warn("[AppSocketProvider] Không đọc được dữ liệu branch từ localStorage")
      return null
    }
  })

  const socketUrl = settingsData?.link_connect_socket ?? null
  const dbName = settingsData?.db_name ?? null

  // Map branch → auth shape mà SocketProvider cần
  const auth =
    branch?.id && branch?.name
      ? {
          staff_id: branch.id,       // id của branch
          user_full_name: branch.name, // name của branch
        }
      : null

  return (
    <SocketProvider url={socketUrl} auth={auth} dbName={dbName}>
      {children}
    </SocketProvider>
  )
}
