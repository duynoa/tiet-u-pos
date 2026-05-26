"use client"

import { useEffect, useState } from "react"

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

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
    <div className="flex flex-col items-end gap-0 md:gap-3">
      <p className="text-white text-base md:text-[32px] font-bold">{timeString}</p>
      <p className="text-white text-sm md:text-2xl">{dateString}</p>
    </div>
  )
}

export default Clock
