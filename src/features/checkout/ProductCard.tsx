"use client"

import Image from "next/image"
import { motion, useMotionValue, useTransform, animate } from "motion/react"
import toast from "react-hot-toast"

const DELETE_THRESHOLD = -80
const SWIPE_RANGE = 100

const products = [
  { id: 1, image: "/product-1.webp", name: "Sữa Tươi Vinamilk 1L", sku: "VMK-1L · 8934822500120", price: 35000 },
  { id: 2, image: "/product-2.webp", name: "Sữa Tươi Vinamilk 1L", sku: "VMK-1L · 8934822500120", price: 35000 },
  { id: 3, image: "/product-3.webp", name: "Sữa Tươi Vinamilk 1L", sku: "VMK-1L · 8934822500120", price: 35000 },
  { id: 4, image: "/product-2.webp", name: "Sữa Tươi Vinamilk 1L", sku: "VMK-1L · 8934822500120", price: 35000 },
  { id: 5, image: "/product-1.webp", name: "Sữa Tươi Vinamilk 1L", sku: "VMK-1L · 8934822500120", price: 35000 },
]

const ProductCard = ({ product, quantity, onDecrement, onIncrement, onRemove }: {
  product: typeof products[0]
  quantity: number
  onDecrement: () => void
  onIncrement: () => void
  onRemove: () => void
}) => {
  const x = useMotionValue(0)
  const deleteOpacity = useTransform(x, [DELETE_THRESHOLD, -20, 0], [1, 0.8, 0])
  const deleteScale = useTransform(x, [DELETE_THRESHOLD, 0], [1, 0.7])
  const deleteTranslate = useTransform(x, [DELETE_THRESHOLD, 0], [0, 20])

  const handleDragEnd = () => {
    const currentX = x.get()
    if (currentX < DELETE_THRESHOLD) {
      animate(x, -window.innerWidth, { type: "spring", stiffness: 200, damping: 25 })
      setTimeout(() => {
        onRemove()
        toast.success(`Đã xóa ${product.name}`, {
          duration: 3000,
          style: { background: "#22C55E", color: "#fff", fontWeight: "bold" },
        })
      }, 350)
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 28 })
    }
  }

  const formattedPrice = product.price.toLocaleString("vi-VN") + " ₫"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="shrink-0 relative overflow-hidden rounded-2xl"
    >
      {/* Delete background revealed on swipe */}
      <motion.div
        className="absolute inset-0 bg-[#EF4444] flex items-center justify-end pr-6 rounded-2xl"
        style={{ opacity: deleteOpacity, scale: deleteScale, x: deleteTranslate }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M6.66669 8.66667L25.3334 25.3333M6.66669 25.3333L25.3334 8.66667" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      <motion.div
        className="relative bg-white cursor-grab active:cursor-grabbing"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -SWIPE_RANGE, right: 0 }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.01, boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}
        whileTap={{ scale: 0.99 }}
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
            <motion.button
              onClick={onDecrement}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl bg-[#FFE0E0] flex items-center justify-center cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" viewBox="0 0 10 2" fill="none">
                <path d="M0.583374 0.583328H8.75004" stroke="#0B0C0C" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
            <motion.span
              key={quantity}
              initial={{ scale: 1.3, color: "#1E2939" }}
              animate={{ scale: 1, color: "#1E2939" }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="min-w-9 h-9 text-xl font-bold text-[#1E2939] text-center flex items-center justify-center"
            >
              {quantity}
            </motion.span>
            <motion.button
              onClick={onIncrement}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl bg-[#CB2527] flex items-center justify-center cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.91663 7H11.0833" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 2.91667V11.0833" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export { ProductCard, products }
