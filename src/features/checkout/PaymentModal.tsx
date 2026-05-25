"use client"

import { OrderData, PaymentInfo, useDeleteOrder } from "@/src/services"
import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import { memo } from "react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  totalPrice: number
  totalItems: number
  vatAmount: number
  vatRate: string
  totalWithVat: number
  orderData: OrderData | null
  paymentInfo: PaymentInfo | null
}

const PaymentModal = memo(function PaymentModal({
  isOpen,
  onClose,
  totalPrice,
  totalItems,
  vatAmount,
  vatRate,
  totalWithVat,
  orderData,
  paymentInfo,
}: PaymentModalProps) {
  const { mutate: deleteOrder } = useDeleteOrder()
  const displayItems = orderData?.items ?? []
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#D4D2D287] backdrop-blur-sm z-80"
            onClick={() => {
              if (paymentInfo?.id) {
                deleteOrder(paymentInfo.id)
              }
              onClose()
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-80 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="flex flex-col gap-8 bg-white px-10 py-12 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  onClick={() => {
                    if (paymentInfo?.id) {
                      deleteOrder(paymentInfo.id)
                    }
                    onClose()
                  }}
                  className="absolute top-0 left-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M7.08325 20.4572L32.0833 20.4572" stroke="#111111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17.1663 30.4978L7.08293 20.4578L17.1663 10.4162" stroke="#111111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <h2 className="text-[#111] text-2xl md:text-4xl font-bold capitalize text-center">Thanh toán đơn hàng</h2>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 px-5 py-3 flex flex-col gap-4 border-r border-[#E9E9E9]">
                  <div className="flex flex-col gap-3">
                    <h3 className="px-3 py-2.5 text-[#111] text-2xl font-bold capitalize">Hóa đơn</h3>
                    <div className="px-3 pt-2 pb-8 flex flex-col gap-3 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
                      {displayItems.length > 0 ? (
                        displayItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <p className="text-[#262626] text-lg font-semibold">{item.name ?? `Sản phẩm #${item.id}`}</p>
                              <p className="text-[#888] text-lg">
                                {typeof item.price === "number" ? item.price.toLocaleString("vi-VN") + " ₫" : "—"} × {item.quantity}
                              </p>
                            </div>
                            <p className="text-[#CB2527] text-lg font-bold">
                              {typeof item.price === "number" ? (item.price * item.quantity).toLocaleString("vi-VN") + " ₫" : "—"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[#262626] text-lg font-semibold">Bánh Oreo Vị Dâu 119g</p>
                            <p className="text-[#888] text-lg">22.000 ₫ × 1</p>
                          </div>
                          <p className="text-[#CB2527] text-lg font-bold">22.000 ₫</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-3 border-t border-[#CECECE] border-dashed">
                    <div className="flex items-center justify-between">
                      <p className="text-[#262626] text-lg font-semibold">Số sản phẩm</p>
                      <p className="text-[#262626] text-lg font-semibold">{totalItems} sản phẩm</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[#262626] text-lg font-semibold">Tổng tiền</p>
                      <p className="text-[#262626] text-lg font-semibold">{totalPrice.toLocaleString("vi-VN")} ₫</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[#262626] text-lg font-semibold">Tiền VAT ({vatRate}%)</p>
                      <p className="text-[#262626] text-lg font-semibold">{vatAmount.toLocaleString("vi-VN")} ₫</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#CECECE] pt-2">
                      <p className="text-[#111] text-3xl font-bold">Thành tiền</p>
                      <p className="text-[#CB2527] text-3xl font-bold">{totalWithVat.toLocaleString("vi-VN")} ₫</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 flex flex-col items-center gap-6">
                  <div className="flex flex-col justify-center items-center gap-2">
                    <p className="text-[#262626] text-base font-semibold">Quét QR để thanh toán</p>
                    <p className="text-[#CB2527] text-2xl font-bold">{totalWithVat.toLocaleString("vi-VN")} ₫</p>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)] rounded-xl">
                      <Image src="/vien-QR.webp" alt="QR Code" width={200} height={200} className="size-full object-cover absolute inset-0 pointer-events-none" />
                      <img src={paymentInfo?.info_payment?.qr ?? paymentInfo?.qr ?? ""} alt="QR Code" width={200} height={200} className="size-[170px] object-cover rounded-xl" />
                    </div>
                    <p className="px-3 py-2 text-[#0285C7] text-sm font-semibold bg-[#DAEDEF] rounded-2xl">
                      Dùng app ngân hàng hoặc ví điện tử quét mã QR
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )
      }
    </AnimatePresence>
  )
})

export default PaymentModal
