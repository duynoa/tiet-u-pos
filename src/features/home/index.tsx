"use client"

import { useGetCheckBranchDetail, useGetInfoSettings, useGetListSlide } from "@/src/services"
import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const STORAGE_KEY = "branch_id"

const HomePage = ({ branchId }: { branchId: string }) => {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const { data: branchData } = useGetCheckBranchDetail(branchId)
  const { data: slidesData } = useGetListSlide()
  const { data: settingsData } = useGetInfoSettings()
  console.log(settingsData)
  
  const slides = slidesData ?? []
  const slide = slides[current] ?? slides[0]

  useEffect(() => {
    if (!branchId) return
    if (branchData && !branchData.isError) {
      localStorage.setItem(STORAGE_KEY, branchId)
    }
  }, [branchData, branchId])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 10000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (!slides.length) return null

  const titleChars = (slide?.title ?? "").split("")

  return (
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
            <Image
              src={slide?.image ?? ""}
              loading="eager"
              alt={`banner-${current}`}
              fill
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default HomePage
