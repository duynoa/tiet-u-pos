"use client"

import { useGetCheckBranchDetail } from "@/src/services"
import { motion } from "motion/react"
import { ReactNode } from "react"

const BranchNotFound = () => (
  <div className="relative flex flex-col items-center justify-center h-screen w-screen bg-[#111] overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(203,37,39,0.25),transparent_70%)]" />
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center gap-10 z-10"
    >
      <div className="w-40 h-40 rounded-full bg-[#CB2527]/20 border border-[#CB2527]/40 flex items-center justify-center">
        <svg
          className="w-20 h-20 text-[#F25B5D]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-3">
        <h2 className="text-6xl text-white font-bold tracking-tight">Chi nhánh không tồn tại</h2>
        <p className="text-2xl text-[#959DA9]">Vui lòng liên hệ nhân viên để được hỗ trợ</p>
      </div>
    </motion.div>
  </div>
)

const BranchLoading = () => (
  <div className="relative flex flex-col items-center justify-center h-screen w-screen bg-linear-to-b from-[#F03D3F] to-[#651213] overflow-hidden">
    <motion.div
      animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.05, 0.95] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="text-4xl text-white font-script"
    >
      Đang tải...
    </motion.div>
  </div>
)

interface BranchGateProps {
  branchId: string
  children: ReactNode
}

export const BranchGate = ({ branchId, children }: BranchGateProps) => {
  const { data: branchData, isLoading, isError } = useGetCheckBranchDetail(branchId)

  const isBranchNotFound = isError || !branchData || (branchData as any)?.success === false

  if (isLoading) return <BranchLoading />
  if (isBranchNotFound) return <BranchNotFound />

  return <>{children}</>
}

export { BranchNotFound, BranchLoading }
