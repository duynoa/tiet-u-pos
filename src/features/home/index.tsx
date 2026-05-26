"use client"

import { useGetCheckBranchDetail, useGetListSlide } from "@/src/services"
import { BranchGate } from "@/src/components/BranchGate"
import { BRANCH_SAVED_EVENT, BRANCH_STORAGE_KEY } from "@/src/providers/app-socket-provider"
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "motion/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const HomePage = ({ branchId }: { branchId: string }) => {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [isReloading, setIsReloading] = useState(false)
  const { data: branchData } = useGetCheckBranchDetail(branchId)
  const { data: slidesData } = useGetListSlide()

  const rotateY = useMotionValue(0)
  const rotateYDisplay = useTransform(rotateY, (v) => `rotateY(${v}deg)`)

  const slides = slidesData ?? []
  const slide = slides[current] ?? slides[0]

  useEffect(() => {
    if (!branchData) return
    localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(branchData))
    window.dispatchEvent(new Event(BRANCH_SAVED_EVENT))
  }, [branchData, branchId])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 10000)
    return () => clearInterval(timer)
  }, [slides.length])

  const handleReload = () => {
    setIsReloading(true)
    animate(rotateY, [0, 360], { duration: 0.8, ease: "easeInOut" })
    setTimeout(() => {
      // Thêm query param để bust browser cache, buộc load code mới từ server
      const url = new URL(window.location.href)
      url.searchParams.set("t", Date.now().toString())
      window.location.href = url.toString()
    }, 600)
  }

  const titleChars = (slide?.title ?? "").split("")

  return (
    <BranchGate branchId={branchId}>
      <div
        className='relative flex flex-col bg-linear-to-b from-[#F03D3F] to-[#651213] h-screen w-screen overflow-hidden'
      >
        <div className="pt-[20%] flex flex-col gap-9 items-center z-10">
          <h2 className="text-8xl text-white font-script text-center flex flex-wrap justify-center" key={current}>
            <AnimatePresence mode="popLayout">
              {titleChars.map((char: string, i: number) => (
                <motion.span
                  key={`${char}-${i}`}
                  initial={{ opacity: 0, y: 40, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </AnimatePresence>
          </h2>
          <p
            key={`desc-${current}`}
            className="text-3xl text-white/80 font-medium text-center leading-relaxed w-[70%]"
          >
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "block" }}
            >
              {slide?.content}
            </motion.span>
          </p>
          <button
            onClick={() => router.push(`/thanh-toan/${branchId}`)}
            className="px-8 py-5 border border-white text-white text-4xl font-medium rounded-full backdrop-blur-xs bg-white/20 shadow-[0_4px_6.1px_0_rgba(255,255,255,0.23)_inset,7px_63px_18px_0_rgba(0,0,0,0.00),4px_40px_16px_0_rgba(0,0,0,0.00),2px_23px_14px_0_rgba(0,0,0,0.02),1px_10px_10px_0_rgba(0,0,0,0.03),0_3px_6px_0_rgba(0,0,0,0.03)] cursor-pointer"
          >
            Thanh toán ngay
          </button>
          <div className="flex items-center gap-3 mt-4">
            {slides.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-500 ${i === current ? "w-11 h-4 bg-white" : "w-4 h-4 bg-white/40"
                  }`}
                aria-label={`Chuyển đến slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              {slide?.image && (
                <Image
                  src={slide.image}
                  loading="eager"
                  alt={`banner-${current}`}
                  fill
                  className="object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <motion.button
          onClick={handleReload}
          animate={{ scale: isReloading ? [1, 0.9, 1.05, 0.95, 1] : 1 }}
          transition={{ duration: 0.5 }}
          style={{ rotate: rotateYDisplay }}
          className="flex items-center gap-2 absolute bottom-10 right-10 py-6 px-8 bg-white/20 border border-white text-white text-4xl font-medium rounded-full backdrop-blur-xs shadow-[0_4px_6.1px_0_rgba(255,255,255,0.23)_inset,7px_63px_18px_0_rgba(0,0,0,0.00),4px_40px_16px_0_rgba(0,0,0,0.00),2px_23px_14px_0_rgba(0,0,0,0.02),1px_10px_10px_0_rgba(0,0,0,0.03),0_3px_6px_0_rgba(0,0,0,0.03)] cursor-pointer"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            animate={{ rotate: isReloading ? 360 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <path d="M4 24C4 28.7739 5.89642 33.3523 9.27208 36.7279C12.6477 40.1036 17.2261 42 22 42C26.78 42 31.36 40.12 34.8 36.8L31.8 33.8C30.5409 35.1334 29.0214 36.1942 27.3357 36.9167C25.65 37.6391 23.834 38.0078 22 38C9.52 38 3.28 22.92 12.1 14.1C20.92 5.28 36 11.54 36 24H30L38 32H38.2L46 24H40C40 19.2261 38.1036 14.6477 34.7279 11.2721C31.3523 7.89642 26.7739 6 22 6C17.2261 6 12.6477 7.89642 9.27208 11.2721C5.89642 14.6477 4 19.2261 4 24Z" fill="white" />
          </motion.svg>
          Tải lại
        </motion.button>
      </div>
    </BranchGate>
  )
}

export default HomePage
