"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

const products = [
  { id: 1, image: "/product-1.webp", name: "Sữa Tươi Vinamilk 1L", sku: "VMK-1L · 8934822500120", price: 35000 },
  { id: 2, image: "/product-2.webp", name: "Sữa Tươi Vinamilk 1L", sku: "VMK-1L · 8934822500120", price: 35000 },
  { id: 3, image: "/product-3.webp", name: "Sữa Tươi Vinamilk 1L", sku: "VMK-1L · 8934822500120", price: 35000 },
  { id: 4, image: "/product-3.webp", name: "Sữa Tươi Vinamilk 1L", sku: "VMK-1L · 8934822500120", price: 35000 },
  { id: 5, image: "/product-3.webp", name: "Sữa Tươi Vinamilk 1L", sku: "VMK-1L · 8934822500120", price: 35000 },
]

const ProductCard = ({ product, quantity, onDecrement, onIncrement, onRemove }: {
  product: typeof products[0]
  quantity: number
  onDecrement: () => void
  onIncrement: () => void
  onRemove: () => void
}) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [translateX, setTranslateX] = useState(0)
  const [isRemoving, setIsRemoving] = useState(false)
  const startXRef = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = startXRef.current - e.touches[0].clientX
    if (diff > 0) {
      setTranslateX(-Math.min(diff, 100))
    }
  }

  const handleTouchEnd = () => {
    if (translateX < -60) {
      setIsRemoving(true)
      setTimeout(onRemove, 200)
    } else {
      setTranslateX(0)
    }
  }

  if (isRemoving) return null

  const formattedPrice = product.price.toLocaleString("vi-VN") + " ₫"

  return (
    <div
      ref={trackRef}
      className="shrink-0 relative overflow-hidden rounded-2xl transition-all duration-200"
      style={{ transform: `translateX(${translateX}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image src={product.image} alt="product" width={200} height={200} className="w-[94px] h-[94px] object-cover rounded-lg" />
          <div className="flex flex-col gap-3">
            <h3 className="text-base md:text-2xl font-bold text-[#111]">{product.name}</h3>
            <p className="text-sm md:text-xl leading-5 text-[#111]">{product.sku}</p>
            <p className="text-base md:text-2xl leading-5 text-[#CB2527] font-semibold">{formattedPrice}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onDecrement} className="w-9 h-9 rounded-xl bg-[#FFE0E0] flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" viewBox="0 0 10 2" fill="none">
              <path d="M0.583374 0.583328H8.75004" stroke="#0B0C0C" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="min-w-9 h-9 text-xl font-bold text-[#1E2939] text-center flex items-center justify-center">{quantity}</span>
          <button onClick={onIncrement} className="w-9 h-9 rounded-xl bg-[#CB2527] flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.91663 7H11.0833" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 2.91667V11.0833" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

const Checkout = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [quantities, setQuantities] = useState<Record<number, number>>(
    Object.fromEntries(products.map((p) => [p.id, 1]))
  )
  const [deletedIds, setDeletedIds] = useState<number[]>([])

  const visibleProducts = products.filter((p) => !deletedIds.includes(p.id))
  const totalItems = visibleProducts.reduce((sum, p) => sum + quantities[p.id], 0)
  const totalPrice = visibleProducts.reduce((sum, p) => sum + p.price * quantities[p.id], 0)
  const formattedPrice = totalPrice.toLocaleString("vi-VN") + " ₫"

  const decrement = (id: number) => setQuantities((prev) => ({ ...prev, [id]: Math.max(0, prev[id] - 1) }))
  const increment = (id: number) => setQuantities((prev) => ({ ...prev, [id]: prev[id] + 1 }))
  const removeProduct = (id: number) => setDeletedIds((prev) => [...prev, id])
  const clearAll = () => setDeletedIds(products.map((p) => p.id))

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
        <Link href='/'>
          <Image src="/logo.webp" alt="logo" width={300} height={300} className="w-[100px] md:w-[179px] object-cover" />
        </Link>
        <div className="flex flex-col items-end gap-0 md:gap-3">
          <p className="text-white text-base md:text-[32px] font-bold">{timeString}</p>
          <p className="text-white text-sm md:text-2xl">{dateString}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 h-full w-full p-4 md:p-6">
        {/* <div className="h-full flex flex-col justify-center items-center gap-4">
          <Image src="/no-card.webp" alt="banner" width={500} height={500} className="w-[360px] h-[360px] object-cover" />
          <h3 className="text-[40px] text-[#111] font-bold">Chưa có sản phẩm nào</h3>
          <p className="text-[#555] text-[32px] font-medium">Hãy quét sản phẩm dưới camera góc phải để order nhé !</p>
        </div> */}
        <div className="flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between">
            <p className="text-xl text-[#555]">Trượt để xóa</p>
            <button onClick={clearAll} className="text-xl font-semibold text-[#F25B5D] hover:text-white hover:bg-[#F25B5D] rounded-2xl px-4 py-2 cursor-pointer transition-all duration-300">Xóa tất cả</button>
          </div>
          <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto">
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
          </div>
        </div>
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
          <button className="py-2 md:py-7 px-2 md:px-4 rounded-md md:rounded-2xl bg-[#959DA9] text-base md:text-4xl font-bold text-white">
            Thanh toán
          </button>
        </div>
      </footer>
    </div>
  )
}

export default Checkout
