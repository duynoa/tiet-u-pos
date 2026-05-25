"use client"

import {
  OrderData,
  PaymentInfo,
  useCreateClient,
  useCreateOrder,
  useGetCheckPhone,
} from "@/src/services"
import { useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { KeyboardMode, VirtualKeyboard } from "./VirtualKeyboard"

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: (
    name: string,
    phone: string,
    orderData: OrderData,
    paymentInfo: PaymentInfo | null
  ) => void
  branchId: string
  orderItems: { id: number; quantity: number }[]
}

const VIETNAM_PHONE_REGEX = /^0[0-9]{9}$/

const CustomerModal = ({
  isOpen,
  onClose,
  onContinue,
  branchId,
  orderItems,
}: CustomerModalProps) => {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [nameError, setNameError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [activeField, setActiveField] = useState<KeyboardMode>("phone")
  const userHasEditedName = useRef(false)
  const isPhoneValid = VIETNAM_PHONE_REGEX.test(phone)
  const { data: checkPhoneData } = useGetCheckPhone(
    isPhoneValid ? phone : ""
  )
  const { mutate: createClient, isPending: isCreating } = useCreateClient()
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isPhoneValid) {
      if (!userHasEditedName.current) setName("")
      return
    }
    if (!checkPhoneData) {
      if (!userHasEditedName.current) setName("")
      return
    }
    if (
      "success" in checkPhoneData &&
      checkPhoneData.success === false &&
      !userHasEditedName.current
    ) {
      setName("")
      return
    }
    if (
      "data" in checkPhoneData &&
      checkPhoneData.data?.fullname &&
      !userHasEditedName.current
    ) {
      setName(checkPhoneData.data.fullname)
    }
  }, [checkPhoneData, phone, isPhoneValid])

  const handleFieldFocus = useCallback((field: KeyboardMode) => {
    setActiveField(field)
  }, [])

  const handleKeyboardChange = useCallback(
    (newValue: string) => {
      if (activeField === "phone") {
        setPhone(newValue)
        setPhoneError("")
      } else {
        userHasEditedName.current = true
        setName(newValue)
        setNameError("")
      }
    },
    [activeField]
  )

  const isExistingCustomer =
    checkPhoneData &&
    "data" in checkPhoneData &&
    !!checkPhoneData.data?.fullname

  const handleContinue = () => {
    let valid = true
    if (!name.trim()) {
      setNameError("Vui lòng nhập tên khách hàng")
      valid = false
    } else {
      setNameError("")
    }
    if (!phone.trim()) {
      setPhoneError("Vui lòng nhập số điện thoại")
      valid = false
    } else {
      setPhoneError("")
    }
    if (!valid) return

    if (isExistingCustomer) {
      userHasEditedName.current = false
      createOrder(
        { phone, branch_id: branchId, items: orderItems },
        {
          onSuccess: (data) => {
            const apiData = data?.data ?? data
            const orderData: OrderData = {
              id: apiData?.id ?? apiData?.order_id,
              items: apiData?.items ?? orderItems,
            }
            const paymentInfo: PaymentInfo | null = apiData?.data ?? null
            onContinue(name, phone, orderData, paymentInfo)
          },
          onError: () => {
            toast.error("Tạo đơn hàng thất bại. Vui lòng thử lại.")
          },
        }
      )
      return
    }

    createClient(
      { phone, fullname: name, branch_id: branchId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["check-phone", phone] })
          userHasEditedName.current = false
          createOrder(
            { phone, branch_id: branchId, items: orderItems },
            {
              onSuccess: (data) => {
                const apiData = data?.data ?? data
                const orderData: OrderData = {
                  id: apiData?.id ?? apiData?.order_id,
                  items: apiData?.items ?? orderItems,
                }
                const paymentInfo: PaymentInfo | null =
                  apiData?.info_payment ?? null
                onContinue(name, phone, orderData, paymentInfo)
              },
              onError: () => {
                toast.error("Tạo đơn hàng thất bại. Vui lòng thử lại.")
              },
            }
          )
        },
      }
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#D4D2D287] backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex flex-col gap-4 items-center justify-center pointer-events-none"
          >
            <div
              className="w-full max-w-2xl max-h-[calc(100vh-430px)] overflow-y-auto bg-white rounded-3xl shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-8 px-[60px] py-[40px]">
                <div className="flex items-center gap-2">
                  <button onClick={onClose} className="cursor-pointer shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      fill="none"
                    >
                      <path
                        d="M7.08325 20.4572L32.0833 20.4572"
                        stroke="#111111"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.1663 30.4978L7.08293 20.4578L17.1663 10.4162"
                        stroke="#111111"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <h2 className="text-[#111] text-2xl md:text-[32px] font-bold capitalize">
                    Nhập Thông tin khách hàng
                  </h2>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M9 3C9.17928 2.99995 9.35528 3.0481 9.50957 3.13941C9.66386 3.23071 9.79076 3.36182 9.877 3.519L9.928 3.629L11.928 8.629C12.0086 8.83016 12.0216 9.05204 11.9651 9.26125C11.9087 9.47045 11.7858 9.65566 11.615 9.789L11.515 9.857L9.841 10.861L9.904 10.964C10.7008 12.229 11.771 13.2992 13.036 14.096L13.138 14.158L14.143 12.486C14.2544 12.3001 14.4231 12.1554 14.6239 12.0737C14.8246 11.992 15.0464 11.9777 15.256 12.033L15.371 12.072L20.371 14.072C20.5375 14.1384 20.6831 14.2484 20.7925 14.3903C20.9019 14.5323 20.9712 14.7011 20.993 14.879L21 15V19C21 20.657 19.657 22 17.94 21.998C9.361 21.477 2.522 14.638 2 6C1.99996 5.23479 2.29233 4.49849 2.81728 3.94174C3.34224 3.38499 4.06011 3.04989 4.824 3.005L5 3H9Z"
                          fill="#555555"
                        />
                      </svg>
                      <label className="text-[#262626] text-lg md:text-2xl font-medium">
                        Số điện thoại
                      </label>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleFieldFocus("phone")}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleFieldFocus("phone")
                      }
                      className={`w-full px-4 py-4 rounded-lg border text-lg md:text-2xl cursor-pointer flex items-center select-none transition-colors ${phoneError
                          ? "border-[#CB2527] bg-red-50"
                          : activeField === "phone"
                            ? "border-[#CB2527] bg-white"
                            : "border-[#C7C7CC] bg-white"
                        }`}
                    >
                      <span
                        className={
                          phone ? "text-[#111]" : "text-[#B0B0B0]"
                        }
                      >
                        {phone || "Nhập số điện thoại"}
                      </span>
                    </div>
                    {phoneError ? (
                      <p className="text-[#CB2527] text-sm md:text-lg font-medium">
                        {phoneError}
                      </p>
                    ) : phone.length > 0 && !isPhoneValid ? (
                      <p className="text-[#CB2527] text-sm md:text-lg font-medium">
                        Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7C17 8.32608 16.4732 9.59785 15.5355 10.5355C14.5979 11.4732 13.3261 12 12 12C10.6739 12 9.40215 11.4732 8.46447 10.5355C7.52678 9.59785 7 8.32608 7 7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2ZM12 14.5C17.525 14.5 22 16.7375 22 19.5V22H2V19.5C2 16.7375 6.475 14.5 12 14.5Z"
                          fill="#555555"
                        />
                      </svg>
                      <label className="text-[#262626] text-lg md:text-2xl font-medium">
                        Tên khách hàng
                      </label>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleFieldFocus("name")}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleFieldFocus("name")
                      }
                      className={`w-full px-4 py-4 rounded-lg border text-lg md:text-2xl cursor-pointer flex items-center select-none transition-colors ${nameError
                          ? "border-[#CB2527] bg-red-50"
                          : activeField === "name"
                            ? "border-[#CB2527] bg-white"
                            : "border-[#C7C7CC] bg-white"
                        }`}
                    >
                      <span
                        className={
                          name ? "text-[#111]" : "text-[#B0B0B0]"
                        }
                      >
                        {name || "Nhập tên khách hàng"}
                      </span>
                    </div>
                    {nameError && (
                      <p className="text-[#CB2527] text-sm md:text-lg font-medium">
                        {nameError}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={isCreating || isCreatingOrder}
                  className="w-full py-4 rounded-xl text-lg md:text-[32px] font-semibold cursor-pointer transition-colors bg-[#CB2527] text-white hover:bg-[#CB2527]/80 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCreating || isCreatingOrder
                    ? "Đang xử lý..."
                    : "Tiếp tục"}
                </button>
              </div>
            </div>

            {/* Keyboard — cố định dưới cùng màn hình */}
            <div className="w-full max-w-2xl z-80 pointer-events-none">
              <div className="pointer-events-auto">
                <VirtualKeyboard
                  value={activeField === "phone" ? phone : name}
                  onChange={handleKeyboardChange}
                  mode={activeField}
                  maxLength={activeField === "phone" ? 10 : 100}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CustomerModal
