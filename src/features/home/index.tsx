"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

const slides = [
  {
    title: "Ngọt ngào từng khoảnh khắc",
    description: "Từ sinh nhật, kỷ niệm đến tiệc nhỏ gia đình — Tiết Ú luôn có mẫu bánh phù hợp cho bạn",
    image: "/banner-1.webp",
  },
  {
    title: "Trao vị ngọt, gửi yêu thương",
    description:
      "Những chiếc bánh được chuẩn bị chỉn chu để ngày vui của bạn thêm trọn vẹn",
    image: "/banner-2.webp",
  },
]

const HomePage = () => {
  const router = useRouter()
  const [current, setCurrent] = useState(0)

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length)

  const slide = slides[current]

  return (
    <div
      className='relative flex flex-col bg-linear-to-b from-[#F03D3F] to-[#651213] h-screen w-screen overflow-hidden'
    >
      <div className="pt-[20%] flex flex-col gap-9 items-center z-10">
        <h2 className="text-8xl text-white font-script text-center">{slide.title}</h2>
        <p className="text-3xl text-white/80 font-medium text-center leading-relaxed w-[70%]">
          {slide.description}
        </p>
        <button
          onClick={() => router.push("/thanh-toan")}
          className="px-8 py-5 border border-white text-white text-2xl font-medium rounded-full backdrop-blur-xs bg-white/20 shadow-[0_4px_6.1px_0_rgba(255,255,255,0.23)_inset,7px_63px_18px_0_rgba(0,0,0,0.00),4px_40px_16px_0_rgba(0,0,0,0.00),2px_23px_14px_0_rgba(0,0,0,0.02),1px_10px_10px_0_rgba(0,0,0,0.03),0_3px_6px_0_rgba(0,0,0,0.03)] cursor-pointer"
        >
          Thanh toán ngay
        </button>
        <div className="flex items-center gap-3 mt-4">
          {slides.map((_, i) => (
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
      <div className={`absolute bottom-0 left-0 w-full ${current === 1 ? "h-full" : ""}`}>
        <Image
          src={slide.image}
          alt={`banner-${current}`}
          width={2000}
          height={2000}
          className="w-full h-full object-cover transition-opacity duration-700"
          priority={current === 0}
        />
      </div>
    </div>
  )
}

export default HomePage
