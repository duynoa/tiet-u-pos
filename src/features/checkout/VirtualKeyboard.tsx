"use client"

import { motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"

export type KeyboardMode = "phone" | "name"

interface VirtualKeyboardProps {
  value: string
  onChange: (value: string) => void
  mode: KeyboardMode
  maxLength?: number
}

// ─── Hằng số bàn phím ─────────────────────────────────────────────────────

const PHONE_KEYS_ROWS = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]

const QWERTY_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
]

const BOTTOM_NAME_KEYS = ["z", "x", "c", "v", "b", "n", "m"]

// ─── Telex Engine ──────────────────────────────────────────────────────────

/**
 * Bảng thanh điệu: index 0=bằng, 1=sắc, 2=huyền, 3=hỏi, 4=ngã, 5=nặng
 */
const VOWEL_TONES: Record<string, string[]> = {
  a:  ["a",  "á",  "à",  "ả",  "ã",  "ạ"],
  ă:  ["ă",  "ắ",  "ằ",  "ẳ",  "ẵ",  "ặ"],
  â:  ["â",  "ấ",  "ầ",  "ẩ",  "ẫ",  "ậ"],
  e:  ["e",  "é",  "è",  "ẻ",  "ẽ",  "ẹ"],
  ê:  ["ê",  "ế",  "ề",  "ể",  "ễ",  "ệ"],
  i:  ["i",  "í",  "ì",  "ỉ",  "ĩ",  "ị"],
  o:  ["o",  "ó",  "ò",  "ỏ",  "õ",  "ọ"],
  ô:  ["ô",  "ố",  "ồ",  "ổ",  "ỗ",  "ộ"],
  ơ:  ["ơ",  "ớ",  "ờ",  "ở",  "ỡ",  "ợ"],
  u:  ["u",  "ú",  "ù",  "ủ",  "ũ",  "ụ"],
  ư:  ["ư",  "ứ",  "ừ",  "ử",  "ữ",  "ự"],
  y:  ["y",  "ý",  "ỳ",  "ỷ",  "ỹ",  "ỵ"],
}

/** Bảng tra ngược: ký tự (có/không dấu, hoa/thường) → [nguyên âm gốc, chỉ số thanh] */
const CHAR_TO_VOWEL: Record<string, [string, number]> = {}
for (const [base, tones] of Object.entries(VOWEL_TONES)) {
  tones.forEach((ch, idx) => {
    CHAR_TO_VOWEL[ch] = [base, idx]
    const upper = ch.toUpperCase()
    if (upper !== ch) CHAR_TO_VOWEL[upper] = [base, idx]
  })
}

/**
 * Nguyên âm cuối có thể là âm đệm (glide) khi đứng sau nguyên âm khác.
 * Khi đó thanh điệu đặt vào nguyên âm đứng trước.
 * Ví dụ: "thuy" → thanh đặt vào 'u', không phải 'y'.
 * Ví dụ: "thao" → thanh đặt vào 'a', không phải 'o'.
 */
const GLIDE_BASES = new Set(["i", "y", "u", "o"])

/** Tìm vị trí nguyên âm chính để gán thanh điệu trong một từ (không có dấu cách) */
function findToneTargetIdx(word: string): number {
  const lower = word.toLowerCase()
  const vowelPos: number[] = []
  for (let i = 0; i < lower.length; i++) {
    if (CHAR_TO_VOWEL[lower[i]]) vowelPos.push(i)
  }
  if (vowelPos.length === 0) return -1

  let target = vowelPos.length - 1
  const lastBase = CHAR_TO_VOWEL[lower[vowelPos[target]]]?.[0]

  // Nếu nguyên âm cuối là âm đệm và có nguyên âm trước → ưu tiên nguyên âm trước
  if (lastBase && GLIDE_BASES.has(lastBase) && target >= 1) target--

  return vowelPos[target]
}

/**
 * Gán thanh điệu vào nguyên âm chính của từ hiện tại trong chuỗi text.
 * Hoạt động đúng khi truyền cả full text (có dấu cách) hoặc chỉ một từ.
 */
function applyTone(text: string, toneIdx: number): string {
  const wordStart = text.lastIndexOf(" ") + 1
  const word = text.slice(wordStart)
  const targetIdx = findToneTargetIdx(word)
  if (targetIdx === -1) return text

  const ch = word[targetIdx]
  const info = CHAR_TO_VOWEL[ch.toLowerCase()]
  if (!info) return text

  const [base] = info
  const isUpper = ch !== ch.toLowerCase()
  const toned = VOWEL_TONES[base]?.[toneIdx] ?? base
  const newChar = isUpper ? toned.toUpperCase() : toned

  return (
    text.slice(0, wordStart + targetIdx) +
    newChar +
    text.slice(wordStart + targetIdx + 1)
  )
}

/** Quy tắc biến đổi nguyên âm Telex (không bao gồm undo — dùng ⌫ để sửa) */
const TELEX_VOWEL_RULES = [
  { end: "a", trigger: "a", result: "â" }, // aa → â
  { end: "a", trigger: "w", result: "ă" }, // aw → ă
  { end: "e", trigger: "e", result: "ê" }, // ee → ê
  { end: "o", trigger: "o", result: "ô" }, // oo → ô
  { end: "o", trigger: "w", result: "ơ" }, // ow → ơ
  { end: "u", trigger: "w", result: "ư" }, // uw → ư
  { end: "d", trigger: "d", result: "đ" }, // dd → đ
]

/** Phím thanh điệu Telex: phím → chỉ số thanh (0=xóa dấu) */
const TELEX_TONE_KEYS: Record<string, number> = {
  s: 1, // sắc (´)
  f: 2, // huyền (`)
  r: 3, // hỏi (?)
  x: 4, // ngã (~)
  j: 5, // nặng (.)
  z: 0, // xóa thanh
}

/**
 * Thử áp dụng Telex transformation cho current word + key.
 * @param word từ đang gõ (không có dấu cách)
 * @param lowerKey phím vừa bấm (lowercase)
 * @returns new word nếu transform thành công, null nếu không có gì thay đổi
 */
function tryTelex(word: string, lowerKey: string): string | null {
  const lowerWord = word.toLowerCase()

  // --- Biến đổi nguyên âm ---
  for (const rule of TELEX_VOWEL_RULES) {
    if (rule.trigger !== lowerKey) continue
    if (!lowerWord.endsWith(rule.end)) continue

    const startIdx = word.length - rule.end.length
    const prefix = word.slice(0, startIdx)
    const matchedChar = word[startIdx]
    const isUpper = matchedChar !== matchedChar.toLowerCase()
    const resultChar = isUpper ? rule.result.toUpperCase() : rule.result
    return prefix + resultChar
  }

  // --- Thanh điệu ---
  if (lowerKey in TELEX_TONE_KEYS) {
    const toneIdx = TELEX_TONE_KEYS[lowerKey]
    // Truyền word (không có dấu cách) → wordStart=0, hoạt động đúng
    const newWord = applyTone(word, toneIdx)
    if (newWord !== word) return newWord
    // Không tìm được nguyên âm hoặc tone giống hệt → gõ key bình thường
  }

  return null
}

// ─── Helpers ──────────────────────────────────────────────────────────────

type ShiftMode = "off" | "once" | "caps"
const KEY_HEIGHT = "h-[72px]"

function computeAfterSpace(text: string): boolean {
  return text === "" || text.endsWith(" ")
}

function applyShiftLogic(
  char: string,
  shiftMode: ShiftMode,
  afterSpace: boolean
): { finalChar: string; nextShiftMode: ShiftMode } {
  let finalChar = char
  let nextShiftMode: ShiftMode = shiftMode

  if (afterSpace) {
    finalChar = char.toUpperCase()
  } else if (shiftMode === "caps") {
    finalChar = char.toUpperCase()
  } else if (shiftMode === "once") {
    finalChar = char.toUpperCase()
    nextShiftMode = "off"
  } else {
    finalChar = char.toLowerCase()
  }

  return { finalChar, nextShiftMode }
}

// ─── KeyButton ─────────────────────────────────────────────────────────────

interface KeyButtonProps {
  label: string
  onPress: () => void
  isWide?: boolean
  isAction?: boolean
  isOk?: boolean
  isSpecial?: boolean
  disabled?: boolean
  isPhoneMode?: boolean
  isUppercase?: boolean
  shake?: boolean
}

const KeyButton = ({
  label,
  onPress,
  isWide,
  isAction,
  isOk,
  isSpecial,
  disabled,
  isPhoneMode,
  isUppercase,
  shake,
}: KeyButtonProps) => {
  if (label === "") return <div className={`flex-[1_1_9%] ${KEY_HEIGHT}`} />

  const cls = [
    "flex items-center justify-center rounded-2xl font-bold select-none transition-all duration-75",
    KEY_HEIGHT,
    isWide    ? "flex-1"         : "flex-[1_1_9%]",
    isOk      ? "bg-[#CB2527] text-white active:bg-[#A01E1F]"              : "",
    isAction  ? "bg-[#EEEEEE] text-[#111] active:bg-[#C5C5C5]"            : "",
    isSpecial ? "bg-[#F25B5D] text-white active:bg-[#D94445]"             : "",
    !isOk && !isAction && !isSpecial
              ? "bg-white text-[#111] border border-[#E0E0E0] active:bg-[#E8E8E8]" : "",
    disabled  ? "opacity-30 cursor-not-allowed pointer-events-none"        : "",
    shake     ? "animate-shake"                                            : "",
  ].filter(Boolean).join(" ")

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={() => { if (!disabled) onPress() }}
      className={cls}
      disabled={disabled}
    >
      {label === "DEL" || label === "⌫" ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3.7 12.29c.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0L14 13.41l-2.89 2.89c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41L12.59 12 9.7 9.11c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L14 10.59l2.89-2.89c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41L15.41 12l2.89 2.89z"
            fill="currentColor"
          />
        </svg>
      ) : label === "OK" ? (
        <span className="text-2xl font-bold">OK</span>
      ) : (
        <span
          className={`font-bold ${isPhoneMode ? "text-3xl" : "text-xl"} ${
            isUppercase ? "text-[#CB2527]" : ""
          }`}
        >
          {label}
        </span>
      )}
    </motion.button>
  )
}

// ─── VirtualKeyboard ─────────────────────────────────────────────────────

export const VirtualKeyboard = ({
  value,
  onChange,
  mode,
  maxLength = 255,
}: VirtualKeyboardProps) => {
  const [shiftMode, setShiftMode] = useState<ShiftMode>("off")
  const [shake, setShake]        = useState(false)
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const afterSpace = computeAfterSpace(value)

  const isUppercaseMode = shiftMode !== "off" || afterSpace

  const triggerShake = useCallback(() => {
    setShake(true)
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current)
    shakeTimerRef.current = setTimeout(() => setShake(false), 400)
  }, [])

  const handleKey = useCallback(
    (key: string) => {
      if (value.length >= maxLength) { triggerShake(); return }

      // --- Telex mode (luôn bật cho mode name) ---
      if (mode === "name") {
        const wordStart = value.lastIndexOf(" ") + 1
        const currentWord = value.slice(wordStart)
        const newWord = tryTelex(currentWord, key.toLowerCase())

        if (newWord !== null) {
          // Transform thành công: ghép lại với phần trước (không thay đổi shift state)
          onChange(value.slice(0, wordStart) + newWord)
          return
        }
        // Không transform → fall through để gõ bình thường với shift logic
        // (vẫn cho phép gõ ký tự thường nếu không có rule nào khớp)
      }

      // --- Gõ bình thường (có shift logic) ---
      if (mode === "name") {
        const { finalChar, nextShiftMode } = applyShiftLogic(
          key,
          shiftMode,
          afterSpace
        )
        setShiftMode(nextShiftMode)
        onChange(value + finalChar)
      } else {
        onChange(value + key)
      }
    },
    [value, maxLength, onChange, mode, shiftMode, afterSpace, triggerShake]
  )

  const handleBackspace = useCallback(() => {
    if (value.length === 0) return
    onChange(value.slice(0, -1))
  }, [value, onChange])

  const handleSpace = useCallback(() => {
    if (value.length >= maxLength) { triggerShake(); return }
    onChange(value + " ")
  }, [value, maxLength, onChange, triggerShake])

  // Bắt sự kiện bàn phím vật lý (để dev dễ hơn)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
      if (e.key === "Escape") return

      if (e.key === "Backspace") { e.preventDefault(); handleBackspace(); return }

      if (mode === "phone") {
        if (/^[0-9]$/.test(e.key)) { e.preventDefault(); handleKey(e.key) }
      } else {
        if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); handleKey(e.key.toLowerCase()) }
        else if (e.key === " ")        { e.preventDefault(); handleSpace() }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleBackspace, handleKey, handleSpace, mode])

  const handleShift = () => {
    if      (shiftMode === "off")  setShiftMode("once")
    else if (shiftMode === "once") setShiftMode("caps")
    else                           setShiftMode("off")
  }

  const currentRows = mode === "phone" ? PHONE_KEYS_ROWS : QWERTY_ROWS

  return (
    <div className="flex flex-col gap-2 p-3 bg-[#E8E8E8] rounded-3xl select-none">
      <div className="flex flex-col gap-2">

        {/* ── Name: dãy số trên đầu ── */}
        {mode === "name" && (
          <div className="flex gap-2">
            {["1","2","3","4","5","6","7","8","9","0"].map((key) => (
              <KeyButton
                key={key}
                label={key}
                onPress={() => handleKey(key)}
                isPhoneMode
              />
            ))}
          </div>
        )}

        {/* ── Hàng QWERTY / số ── */}
        {currentRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {row.map((key, keyIndex) => {
              const displayKey = isUppercaseMode ? key.toUpperCase() : key
              return (
                <KeyButton
                  key={`${rowIndex}-${keyIndex}`}
                  label={displayKey}
                  onPress={() => handleKey(key)}
                  isPhoneMode={mode === "phone"}
                  isUppercase={isUppercaseMode && mode === "name"}
                />
              )
            })}
          </div>
        ))}

        {/* ── Phone: 0 và ⌫ ── */}
        {mode === "phone" && (
          <div className="flex gap-2">
            <div className="flex-[1_1_9%]" />
            <KeyButton label="0"  onPress={() => handleKey("0")} isPhoneMode shake={shake} />
            <KeyButton label="⌫" onPress={handleBackspace}       isSpecial isPhoneMode />
          </div>
        )}

        {/* ── Name: shift + z→m + ⌫ ── */}
        {mode === "name" && (
          <div className="flex gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={handleShift}
              className={`w-[80px] shrink-0 ${KEY_HEIGHT} rounded-2xl font-bold text-xl transition-all duration-75 flex items-center justify-center ${
                isUppercaseMode
                  ? "bg-[#CB2527] text-white active:bg-[#A01E1F]"
                  : "bg-[#EEEEEE] text-[#111] active:bg-[#C5C5C5]"
              }`}
            >
              {shiftMode === "caps" ? "🔒" : "⬆"}
            </motion.button>

            <div className="flex gap-2 flex-1">
              {BOTTOM_NAME_KEYS.map((key) => (
                <KeyButton
                  key={key}
                  label={isUppercaseMode ? key.toUpperCase() : key}
                  onPress={() => handleKey(key)}
                  isPhoneMode={false}
                  isUppercase={isUppercaseMode}
                />
              ))}
              <KeyButton label="⌫" onPress={handleBackspace} isSpecial isPhoneMode={false} />
            </div>
          </div>
        )}



        {/* ── Name: Spacebar ── */}
        {mode === "name" && (
          <div className="flex gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleSpace}
              className={`flex-1 h-[72px] rounded-2xl text-xl font-medium flex items-center justify-center transition-all duration-75 border ${
                shake
                  ? "bg-red-100 border-red-300 text-red-400"
                  : "bg-white text-[#555] border-[#E0E0E0] active:bg-[#E8E8E8]"
              }`}
            >
              Dấu cách
            </motion.button>
          </div>
        )}

      </div>
    </div>
  )
}
