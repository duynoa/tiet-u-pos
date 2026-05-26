"use client"

import { AnimatePresence, motion } from "motion/react"

interface SessionTimeoutModalProps {
  isOpen: boolean
  countdown: number
  onContinue: () => void
}

const SessionTimeoutModal = ({ isOpen, countdown, onContinue }: SessionTimeoutModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-[#111]/45 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-2xl pointer-events-auto">
              <div className="flex flex-col items-center gap-6 px-6 py-8 md:px-10 md:py-10">
                <div className="flex size-16 md:size-20 items-center justify-center rounded-full bg-[#FFF1F1] text-[#CB2527]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="md:size-12"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </div>

                <div className="flex flex-col items-center gap-3 text-center">
                  <h2 className="text-[#111] text-2xl md:text-[32px] font-bold">
                    Phiên sắp kết thúc
                  </h2>
                  <p className="max-w-[380px] text-[#555] text-base md:text-xl font-medium leading-relaxed">
                    Bạn đã không tương tác trong một lúc. Hệ thống sẽ tự động quay về trang chủ.
                  </p>
                </div>

                <div className="flex w-full items-center justify-center gap-4 rounded-2xl border border-[#F1D7D7] bg-[#FFF8F8] px-5 py-4">
                  <span className="text-[#555] text-base md:text-xl font-semibold">
                    Còn lại
                  </span>
                  <div className="flex size-16 md:size-20 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(203,37,39,0.16)] ring-4 ring-[#FFE2E2]">
                    <span className="text-[#CB2527] text-3xl md:text-[40px] font-bold tabular-nums leading-none">
                      {countdown}
                    </span>
                  </div>
                  <span className="text-[#555] text-base md:text-xl font-semibold">
                    giây
                  </span>
                </div>

                <button
                  onClick={onContinue}
                  className="w-full rounded-2xl bg-[#CB2527] px-6 py-4 text-white text-xl md:text-[28px] font-bold cursor-pointer shadow-[0_10px_24px_rgba(203,37,39,0.24)] transition-all duration-200 hover:bg-[#A81F21] active:scale-[0.98]"
                >
                  Tiếp tục mua hàng
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SessionTimeoutModal
