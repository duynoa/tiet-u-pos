"use client"

import { useGetInfoSettings } from "@/src/services"
import { useEffect, useState } from "react"
import { SocketProvider } from "./socket-provider"

export const BRANCH_STORAGE_KEY = "branch"
export const BRANCH_SAVED_EVENT = "branchDataSaved"

function readBranchFromStorage(): BranchData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(BRANCH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    console.warn("[AppSocketProvider] Không đọc được dữ liệu branch từ localStorage")
    return null
  }
}

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

  // Đọc localStorage đồng bộ lần đầu, cập nhật lại khi có branch mới được lưu
  const [branch, setBranch] = useState<BranchData | null>(readBranchFromStorage)

  useEffect(() => {
    const handleBranchSaved = () => {
      const data = readBranchFromStorage()
      if (data) setBranch(data)
    }
    // storage event: cross-tab; branchDataSaved event: same-tab
    window.addEventListener("storage", handleBranchSaved)
    window.addEventListener(BRANCH_SAVED_EVENT, handleBranchSaved)
    return () => {
      window.removeEventListener("storage", handleBranchSaved)
      window.removeEventListener(BRANCH_SAVED_EVENT, handleBranchSaved)
    }
  }, [])

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
