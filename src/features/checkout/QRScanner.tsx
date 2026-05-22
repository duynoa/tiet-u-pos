"use client"

import { Item } from "@/src/services"
import { useCallback, useEffect, useRef } from "react"
import toast from "react-hot-toast"

interface QRScannerProps {
  onItemFound: (item: Item) => void
}

const QRScanner = ({ onItemFound }: QRScannerProps) => {
  const bufferRef = useRef("")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleScan = useCallback((value: string) => {
    const parsed = parseInt(value, 10)
    if (isNaN(parsed)) {
      toast.error("Mã QR không hợp lệ!")
      return
    }
    onItemFound({ id: parsed, name: "", code: "", price: 0, image: "" } as Item)
  }, [onItemFound])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return

      if (e.key === "Enter") {
        e.preventDefault()
        const value = bufferRef.current.trim()
        if (value) handleScan(value)
        bufferRef.current = ""
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        bufferRef.current += e.key
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => { bufferRef.current = "" }, 200)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleScan])

  return null
}

export default QRScanner
