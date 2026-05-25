"use client"

import { useSocket } from "@/src/providers/socket-provider"
import { CartItem, Item, OrderData, PaymentInfo, useGetInfoSettings, useGetItems } from "@/src/services"
import { AnimatePresence } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState, useRef } from "react"
import toast from "react-hot-toast"
import Clock from "./Clock"
import CustomerModal from "./CustomerModal"
import PaymentModal from "./PaymentModal"
import { ProductCard } from "./ProductCard"
import QRScanner from "./QRScanner"
import SuccessModal, { BillPrintData } from "./SuccessModal"

const Checkout = ({ branchId }: { branchId: string }) => {
  const router = useRouter()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [deletedIds, setDeletedIds] = useState<number[]>([])
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [successTotalPrice, setSuccessTotalPrice] = useState(0) // thành tiền (đã VAT)
  const billDataRef = useRef<BillPrintData | null>(null)
  const [billData, setBillData] = useState<BillPrintData | null>(null)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)

  const { socket } = useSocket()
  const { data: settingsData } = useGetInfoSettings()
  const { data: foundItem, isSuccess, isError } = useGetItems(
    branchId,
    pendingId ?? 0,
    { enabled: pendingId !== null }
  )

  const processFoundItem = useCallback((item: Item) => {
    setCartItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev
      return [...prev, {
        id: item.id,
        image: item.image ?? "/no-product.webp",
        name: item.name,
        sku: item.code,
        price: typeof item.price === "string" ? parseInt(item.price, 10) : item.price,
      }]
    })
    setQuantities((prev) => ({
      ...prev,
      [item.id]: deletedIds.includes(item.id) ? 1 : (prev[item.id] ?? 0) + 1,
    }))
    setDeletedIds((prev) => prev.filter((id) => id !== item.id))
  }, [deletedIds])

  useEffect(() => {
    if (!pendingId) return
    if (isSuccess && foundItem) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- React Query callback pattern
      processFoundItem(foundItem)
      setPendingId(null)
    } else if (isError) {
      toast.error("Không tìm thấy sản phẩm")
      setPendingId(null)
    }
  }, [pendingId, isSuccess, isError, foundItem, processFoundItem])

  const handleItemFound = useCallback((item: Item) => {
    setPendingId(item.id)
  }, [])

  const visibleProducts = cartItems.filter((p) => !deletedIds.includes(p.id))
  const totalItems = visibleProducts.reduce((sum, p) => sum + quantities[p.id], 0)
  const totalPrice = visibleProducts.reduce((sum, p) => sum + p.price * quantities[p.id], 0)
  const vatRate = settingsData?.vat ? parseFloat(settingsData.vat) : 0
  const vatAmount = Math.round(totalPrice * vatRate / 100)
  const totalWithVat = totalPrice + vatAmount
  const formattedPrice = totalWithVat.toLocaleString("vi-VN") + " ₫"
  const formattedVat = vatAmount.toLocaleString("vi-VN") + " ₫"
  const formattedSubtotal = totalPrice.toLocaleString("vi-VN") + " ₫"

  const decrement = (id: number) => setQuantities((prev) => ({ ...prev, [id]: Math.max(0, prev[id] - 1) }))
  const increment = (id: number) => setQuantities((prev) => ({ ...prev, [id]: prev[id] + 1 }))
  const removeProduct = (id: number) => setDeletedIds((prev) => [...prev, id])
  const clearAll = () => {
    setCartItems([])
    setQuantities({})
    setDeletedIds(cartItems.map((p) => p.id))
    toast.success("Đã xóa tất cả sản phẩm")
  }

  const handleCancelOrder = () => {
    setCartItems([])
    setQuantities({})
    setDeletedIds([])
    setOrderData(null)
    setPaymentInfo(null)
    setIsCustomerModalOpen(false)
    setIsPaymentModalOpen(false)
    toast.success("Đã hủy đơn hàng")
    router.push(`/${branchId}`)
  }

  const handleCustomerContinue = (name: string, phone: string, orderData: OrderData, paymentInfo: PaymentInfo | null) => {
    setOrderData(orderData)
    setPaymentInfo(paymentInfo)
    billDataRef.current = {
      orderId: paymentInfo?.id ?? orderData.id,
      items: visibleProducts.map((p) => ({
        id: p.id,
        name: p.name,
        quantity: quantities[p.id],
        price: p.price,
        sku: p.sku,
      })),
      totalPrice,
      vatAmount,
      vatRate: settingsData?.vat ?? "0",
      totalWithVat,
      customerName: name,
      customerPhone: phone,
      zaloOaImage: settingsData?.zalo_oa_image,
    }
    setIsPaymentModalOpen(true)
  }

  const handlePaymentModalClose = useCallback(() => {
    setIsPaymentModalOpen(false)
    setOrderData(null)
    setPaymentInfo(null)
  }, [])

  const handleSuccessModalClose = useCallback(() => {
    setCartItems([])
    setQuantities({})
    setDeletedIds([])
    setIsSuccessModalOpen(false)
  }, [])

  // Lắng nghe event từ server — đóng CustomerModal/PaymentModal, mở SuccessModal
  useEffect(() => {
    if (!socket) return
    const handleMessage = (payload: unknown) => {
      const msg = payload as { data?: string | number }
      console.log(msg)
      if (msg.data !== undefined && paymentInfo?.id !== undefined && msg.data === paymentInfo.id) {
        setIsCustomerModalOpen(false)
        setIsPaymentModalOpen(false)
        setSuccessTotalPrice(totalWithVat)
        setBillData(billDataRef.current)
        setIsSuccessModalOpen(true)
      }
    }
    socket.on("payment_order", handleMessage)
    return () => {
      socket.off("payment_order", handleMessage)
    }
  }, [socket, paymentInfo?.id, totalWithVat])

  return (
    <>
      <QRScanner
        onItemFound={handleItemFound}
      />
      <div className="h-screen bg-[#EEEEEE] flex flex-col">
        {/* Header */}
        <header className="bg-[#222] p-2 md:p-6 flex items-center justify-between shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),_0_4px_6px_-4px_rgba(0,0,0,0.10);]">
          <Link href={`/${branchId}`} className="flex items-center gap-3 hover:bg-white/10 rounded-2xl py-2 px-2 md:px-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M5.66669 16.3657L25.6667 16.3657" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.7331 24.3983L5.66643 16.3663L13.7331 8.33293" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-white text-base md:text-[32px] font-bold">Thoát</span>
          </Link>
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href={`/${branchId}`}>
              <Image src="/logo.webp" alt="logo" width={300} height={300} loading="eager" className="w-[100px] md:w-[200px] object-cover" />
            </Link>
          </div>
          <Clock />
        </header>

        {/* Main Content */}
        <main className="flex-1 min-h-0 h-full w-full p-4 md:p-6">
          {visibleProducts.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center gap-4">
              <Image src="/no-card.webp" alt="banner" width={500} height={500} loading="eager" className="w-[360px] h-[360px] object-cover" />
              <h3 className="text-[40px] text-[#111] font-bold">Chưa có sản phẩm nào</h3>
              <p className="text-[#555] text-[32px] font-medium">Hãy quét mã QR sản phẩm để order nhé !</p>
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
            <div className="flex items-center justify-between py-0 md:py-3">
              <h3 className="text-[#111] text-base md:text-[32px] font-bold">Tổng tiền</h3>
              <p className="text-[#111] text-base md:text-[32px] font-bold">{formattedSubtotal}</p>
            </div>
            <div className="flex items-center justify-between py-0 md:py-3">
              <h3 className="text-[#111] text-base md:text-[32px] font-bold">Tiền VAT ({settingsData?.vat ?? "0"}%)</h3>
              <p className="text-[#111] text-base md:text-[32px] font-bold">{formattedVat}</p>
            </div>
            <div className="flex items-center justify-between py-0 md:py-3 border-t-2 border-[#EEE]">
              <h3 className="text-[#111] text-base md:text-[40px] font-bold capitalize">Thành tiền</h3>
              <p className="text-[#CB2527] text-base md:text-[40px] font-bold">{formattedPrice}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-6 py-4">
            <button onClick={handleCancelOrder} className="py-2 md:py-7 px-2 md:px-4 rounded-md md:rounded-2xl border-2 border-[#959DA9] text-base md:text-4xl font-bold text-[#555] cursor-pointer">
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
          key={isCustomerModalOpen ? "open" : "closed"}
          isOpen={isCustomerModalOpen}
          onClose={() => { setIsCustomerModalOpen(false); setOrderData(null); setPaymentInfo(null) }}
          branchId={branchId}
          orderItems={visibleProducts.map((p) => ({ id: p.id, quantity: quantities[p.id], name: p.name, price: p.price }))}
          onContinue={(name, phone, orderData, paymentInfo) => handleCustomerContinue(name, phone, orderData, paymentInfo)}
        />

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          totalPrice={totalPrice}
          totalItems={totalItems}
          vatAmount={vatAmount}
          vatRate={settingsData?.vat ?? "0"}
          totalWithVat={totalWithVat}
          orderData={orderData}
          paymentInfo={paymentInfo}
        />

        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleSuccessModalClose}
          totalPrice={successTotalPrice}
          billData={billData ?? undefined}
        />
      </div>
    </>
  )
}

export default Checkout
