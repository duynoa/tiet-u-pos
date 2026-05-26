"use client"

import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import { useMemo, useRef } from "react"
import toast from "react-hot-toast"
import BillPrint from "./BillPrint"

export interface BranchInfo {
  label: string
  address: string
  phone: string
}

export interface BillPrintData {
  orderId?: string
  items: Array<{ id: number; name: string; quantity: number; price: number; sku?: string }>
  totalPrice: number
  vatAmount: number
  vatRate: string
  totalWithVat: number
  customerName?: string
  customerPhone?: string
  storeName?: string
  branches?: BranchInfo[]
  hotlines?: string[]
  cashierName?: string
  orderDate?: string
  footerMessage?: string
  zaloOaImage?: string
}

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  totalPrice: number
  billData?: BillPrintData
}

const SuccessModal = ({ isOpen, onClose, totalPrice, billData }: SuccessModalProps) => {
  const formattedPrice = totalPrice.toLocaleString("vi-VN") + " ₫"
  const modalRef = useRef<HTMLDivElement>(null)
  const printContentRef = useRef<HTMLDivElement>(null)

  const currentTime = useMemo(() => {
    if (!isOpen) return ""
    const now = new Date()
    const day = String(now.getDate()).padStart(2, "0")
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const year = now.getFullYear()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    return `${day}/${month}/${year}, ${hours}:${minutes}`
  }, [isOpen])

  const handlePrintBill = async () => {
    if (!printContentRef.current || !billData) return

    const popupToastId = toast.loading("Đang mở cửa sổ in...")
    const printWindow = window.open("", "_blank")
    toast.dismiss(popupToastId)
    if (!printWindow) {
      toast.error("Trình duyệt đã chặn popup. Vui lòng cho phép popup cho trang này rồi thử lại.", { duration: 6000 })
      return
    }

    const html = printContentRef.current.innerHTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Hóa đơn - Tiết Ú</title>
          <base href="${window.location.origin}" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `)
    printWindow.document.close()

    const images = printWindow.document.images
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = resolve
        img.onerror = resolve
      })
    })

    Promise.all([printWindow.document.fonts.ready, ...imagePromises]).then(() => {
      printWindow.focus()
      printWindow.print()
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#D4D2D287] backdrop-blur-sm z-60"
          />


          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              ref={modalRef}
              className="relative flex flex-col items-center gap-8 bg-white px-10 py-12 rounded-3xl w-full max-w-3xl pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src="/tung-hoa.webp" alt="Zalo OA" width={500} height={500} className="w-full h-auto absolute inset-0 pointer-events-none" />
              <div className="w-full flex flex-col items-center gap-8">
                <h2 className="text-[#111] text-[32px] font-bold capitalize">Thanh toán thành công</h2>
                <div className="bg-[#CCEFD8CC] p-6 rounded-full">
                  <div className="aspect-square p-6 flex items-center justify-center bg-[#56C348] rounded-full shadow-[0_1px_3px_0_rgba(0,0,0,0.10),0_1px_2px_-1px_rgba(0,0,0,0.10)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="25" viewBox="0 0 33 25" fill="none">
                      <path d="M29.6667 3L11.3333 21.3333L3 13" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <p className="text-[#CB2527] text-3xl md:text-[32px] font-bold">{formattedPrice}</p>
                  <p className="text-[#555] text-base font-semibold">{currentTime}</p>
                </div>

                <div className="flex gap-4 w-full">
                  <button
                    onClick={onClose}
                    className="w-full p-4 rounded-2xl border-2 border-[#959DA9] bg-[#F9FAFB66] text-[#555] text-xl md:text-[32px] font-semibold cursor-pointer transition-colors hover:bg-[#EEEFEF] hover:border-[#7A7F87]"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={handlePrintBill}
                    disabled={!billData}
                    className={`flex items-center justify-center gap-2 w-full p-4 rounded-2xl border-2 text-xl md:text-[32px] font-semibold cursor-pointer transition-colors ${!billData ? "border-[#959DA9] bg-[#959DA9] text-white" : "border-[#CB2527] bg-[#CB2527] text-white hover:bg-[#A81F21] hover:border-[#A81F21]"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M21.3332 21.3334C21.6597 21.3334 21.975 21.4533 22.219 21.6703C22.463 21.8873 22.619 22.1863 22.6572 22.5107L22.6665 22.6667V28C22.6665 28.3266 22.5466 28.6418 22.3295 28.8858C22.1125 29.1299 21.8135 29.2858 21.4892 29.324L21.3332 29.3334H10.6665C10.3399 29.3333 10.0247 29.2134 9.78067 28.9964C9.53663 28.7794 9.38071 28.4804 9.3425 28.156L9.33317 28V22.6667C9.33321 22.3401 9.45311 22.0249 9.67012 21.7809C9.88714 21.5368 10.1862 21.38091.2105 21.3427L10.6665 21.3334H21.3332ZM25.3332 9.33335C26.394 9.33335 27.4115 9.75478 28.1616 10.5049C28.9117 11.2551 29.3332 12.2725 29.3332 13.3334V22.6667C29.3332 23.3739 29.0522 24.0522 28.5521 24.5523C28.052 25.0524 27.3737 25.3334 26.6665 25.3334H25.3332V21.3334C25.3332 20.6261 25.0522 19.9478 24.5521 19.4477C24.052 18.9476 23.3737 18.6667 22.6665 18.6667H9.33317C8.62593 18.6667 7.94765 18.9476 7.44755 19.4477C6.94745 19.9478 6.6665 20.6261 6.6665 21.3334V25.3334H5.33317C4.62593 25.3334 3.94765 25.0524 3.44755 24.5523C2.94746 24.0522 2.6665 23.3739 2.6665 22.6667V13.3334C2.6665 12.2725 3.08793 11.2551 3.83808 10.5049C4.58822 9.75478 5.60564 9.33335 6.6665 9.33335H25.3332ZM22.6665 12H19.9998C19.66 12.0004 19.3331 12.1305 19.086 12.3638C18.8389 12.5971 18.6902 12.916 18.6703 13.2552C18.6504 13.5945 18.7607 13.9285 18.9789 14.1891C19.197 14.4497 19.5064 14.6172 19.8438 14.6574L19.9998 14.6667H22.6665C23.0063 14.6663 23.3332 14.5362 23.5803 14.3029C23.8274 14.0696 23.9761 13.7507 23.9961 13.4115C24.016 13.0722 23.9056 12.7382 23.6875 12.4776C23.4694 12.217 23.16 12.0495 22.8225 12.0094L22.6665 12ZM22.6665 2.66669C23.0201 2.66669 23.3593 2.80716 23.6093 3.05721C23.8594 3.30726 23.9998 3.6464 23.9998 4.00002V6.66669H7.99984V4.00002C7.99984 3.6464 8.14031 3.30726 8.39036 3.05721C8.64041 2.80716 8.97955 2.66669 9.33317 2.66669H22.6665Z" fill="currentColor" />
                    </svg>
                    In Bill
                  </button>
                </div>

                {/* Hidden bill for printing */}
                {billData && (
                  <div className="hidden">
                    <div ref={printContentRef}>
                      <BillPrint {...billData} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SuccessModal
