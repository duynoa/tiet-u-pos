"use client"

import { AnimatePresence } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { ProductCard, products } from "./ProductCard"
import CustomerModal from "./CustomerModal"
import PaymentModal from "./PaymentModal"
import SuccessModal from "./SuccessModal"

const Checkout = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [quantities, setQuantities] = useState<Record<number, number>>(
    Object.fromEntries(products.map((p) => [p.id, 1]))
  )
  const [deletedIds, setDeletedIds] = useState<number[]>([])
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "" })

  const visibleProducts = products.filter((p) => !deletedIds.includes(p.id))
  const totalItems = visibleProducts.reduce((sum, p) => sum + quantities[p.id], 0)
  const totalPrice = visibleProducts.reduce((sum, p) => sum + p.price * quantities[p.id], 0)
  const formattedPrice = totalPrice.toLocaleString("vi-VN") + " ₫"

  const decrement = (id: number) => setQuantities((prev) => ({ ...prev, [id]: Math.max(0, prev[id] - 1) }))
  const increment = (id: number) => setQuantities((prev) => ({ ...prev, [id]: prev[id] + 1 }))
  const removeProduct = (id: number) => setDeletedIds((prev) => [...prev, id])
  const clearAll = () => {
    setDeletedIds(products.map((p) => p.id))
    toast.success("Đã xóa tất cả sản phẩm", {
      duration: 3000,
      style: { background: "#22C55E", color: "#fff", fontWeight: "bold" },
    })
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const timeString = currentTime.toLocaleTimeString("vi-VN")
  const weekdayMap: Record<number, string> = {
    0: "CN", 1: "Th 2", 2: "Th 3", 3: "Th 4",
    4: "Th 5", 5: "Th 6", 6: "Th 7",
  }
  const dateString = `${weekdayMap[currentTime.getDay()]}, ${currentTime.getDate().toString().padStart(2, "0")}/${(currentTime.getMonth() + 1).toString().padStart(2, "0")}/${currentTime.getFullYear()}`

  return (
    <div className="h-screen bg-[#EEEEEE] flex flex-col">
      {/* Header */}
      <header className="bg-[#222] p-2 md:p-6 flex items-center justify-between shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),_0_4px_6px_-4px_rgba(0,0,0,0.10);]">
        <Link href='/' className="flex items-center gap-3 hover:bg-white/10 rounded-2xl py-2 px-2 md:px-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M5.66669 16.3657L25.6667 16.3657" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.7331 24.3983L5.66643 16.3663L13.7331 8.33293" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-white text-base md:text-[32px] font-bold">Thoát</span>
        </Link>
        <Link href='/' className="absolute left-1/2 -translate-x-1/2">
          <Image src="/logo.webp" alt="logo" width={300} height={300} className="w-[100px] md:w-[200px] object-cover" />
        </Link>
        <div className="flex flex-col items-end gap-0 md:gap-3">
          <p className="text-white text-base md:text-[32px] font-bold">{timeString}</p>
          <p className="text-white text-sm md:text-2xl">{dateString}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 h-full w-full p-4 md:p-6">
        {visibleProducts.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center gap-4">
            <Image src="/no-card.webp" alt="banner" width={500} height={500} className="w-[360px] h-[360px] object-cover" />
            <h3 className="text-[40px] text-[#111] font-bold">Chưa có sản phẩm nào</h3>
            <p className="text-[#555] text-[32px] font-medium">Hãy quét sản phẩm dưới camera góc phải để order nhé !</p>
          </div>
        ) : (
        <div className="flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between">
            <p className="text-xl text-[#555]">Trượt để xóa</p>
            <button onClick={clearAll} className="text-xl font-semibold text-[#F25B5D] hover:text-white hover:bg-[#F25B5D] rounded-2xl px-4 py-2 cursor-pointer transition-all duration-300">Xóa tất cả</button>
          </div>
          <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
            <AnimatePresence>
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={quantities[product.id]}
                onDecrement={() => decrement(product.id)}
                onIncrement={() => increment(product.id)}
                onRemove={() => removeProduct(product.id)}
              />
            ))}
          </AnimatePresence>
          </div>
        </div>
        )}
      </main>

      {/* Footer - Fixed */}
      <footer className="px-3 md:px-9 py-2 md:py-6 border-t border-[#F3F4F6] bg-white shadow-[0_-4px_20px_0_rgba(0,0,0,0.06);]">
        <div className="flex flex-col gap-3">
          <p className="py-0 md:py-3 text-[#1D68D8] text-sm md:text-2xl italic font-semibold font-montserrat">*Quý khách vui lòng kiểm tra đúng số lượng sản phẩm trước khi thanh toán </p>
          <div className="flex items-center justify-between py-0 md:py-3">
            <h3 className="text-[#111] text-base md:text-[32px] font-bold">Số sản phẩm</h3>
            <p className="text-[#111] text-base md:text-[32px] font-bold">{totalItems} sản phẩm</p>
          </div>
          <div className="flex items-center justify-between py-0 md:py-3 border-t-2 border-[#EEE]">
            <h3 className="text-[#111] text-base md:text-[40px] font-bold capitalize">Tổng tiền</h3>
            <p className="text-[#CB2527] text-base md:text-[40px] font-bold">{formattedPrice}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:gap-6 py-4">
          <button className="py-2 md:py-7 px-2 md:px-4 rounded-md md:rounded-2xl border-2 border-[#959DA9] text-base md:text-4xl font-bold text-[#555]">
            Hủy đơn
          </button>
          <button
            onClick={() => totalItems > 0 && setIsCustomerModalOpen(true)}
            className={`py-2 md:py-7 px-2 md:px-4 rounded-md md:rounded-2xl text-base md:text-4xl font-bold ${totalItems > 0 ? "bg-[#CB2527] text-white cursor-pointer" : "bg-[#959DA9] text-white"}`}
          >
            Thanh toán
          </button>
        </div>
      </footer>

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onContinue={(name, phone) => {
          setCustomerInfo({ name, phone })
          setIsPaymentModalOpen(true)
        }}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalPrice={totalPrice}
        totalItems={totalItems}
        orderItems={visibleProducts.map((p) => ({ id: p.id, quantity: quantities[p.id] }))}
        customerName={customerInfo.name}
        customerPhone={customerInfo.phone}
        onPaymentSuccess={(name, price) => {
          setIsCustomerModalOpen(false)
          setIsPaymentModalOpen(false)
          setIsSuccessModalOpen(true)
          setCustomerInfo({ name, phone: "" })
        }}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        customerName={customerInfo.name}
        totalPrice={totalPrice}
      />
    </div>
  )
}

export default Checkout
