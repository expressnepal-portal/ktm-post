"use client"

import { useState } from "react"
import { ADToBS, BSToAD } from "bikram-sambat-js"

// Public holidays BS 2083
const HOLIDAYS_2083: Record<string, string> = {
  "2083-01-01": "नव वर्ष",
  "2083-02-15": "बुद्ध जयन्ती",
  "2083-03-15": "शहिद दिवस",
  "2083-04-01": "संविधान दिवस",
  "2083-05-01": "मजदुर दिवस",
  "2083-06-15": "जनाई पूर्णिमा",
  "2083-07-25": "घटस्थापना",
  "2083-08-15": "दशैँ मूल दिन",
  "2083-09-01": "तिहार",
  "2083-10-28": "क्रिसमस",
}

// Holidays BS 2082
const HOLIDAYS_2082: Record<string, string> = {
  "2082-01-01": "नव वर्ष २०८२",
  "2082-02-15": "बुद्ध जयन्ती",
  "2082-04-12": "जनाई पूर्णिमा",
  "2082-05-25": "घटस्थापना",
  "2082-06-05": "विजयादशमी",
  "2082-06-09": "विजयादशमी",
  "2082-07-01": "तिहार प्रारम्भ",
  "2082-09-19": "संविधान दिवस",
  "2082-12-12": "जनैपूर्णिमा",
}

const ALL_HOLIDAYS: Record<string, string> = { ...HOLIDAYS_2082, ...HOLIDAYS_2083 }

const toNepaliNumeral = (n: number | string): string => {
  const digits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]
  return String(n)
    .split("")
    .map((d) => (/\d/.test(d) ? digits[parseInt(d)] : d))
    .join("")
}

const BS_MONTH_NAMES = [
  "बैशाख", "जेठ", "असार", "साउन",
  "भदौ", "असोज", "कार्तिक", "मंसिर",
  "पौष", "माघ", "फाल्गुन", "चैत",
]

const DAY_NAMES_SHORT = ["आ", "सो", "मं", "बु", "बि", "शु", "श"]

const AD_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

export default function NepaliCalendarWidget({ compact = false }: { compact?: boolean }) {
  const todayAd = new Date()
  const todayBsStr = ADToBS(todayAd) // "YYYY-MM-DD"
  const [tY, tM, tD] = todayBsStr.split("-").map(Number)

  const [currentYear, setCurrentYear] = useState(tY)
  const [currentMonth, setCurrentMonth] = useState(tM) // 1-indexed (1-12)

  // Find total days in current BS month by attempting converting BS dates to AD
  let daysInMonth = 30
  for (let d = 32; d >= 29; d--) {
    const testBs = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    try {
      const ad = BSToAD(testBs)
      if (ad && ad !== "Invalid Date") {
        daysInMonth = d
        break
      }
    } catch {
      continue
    }
  }

  // Get weekday of 1st day of current BS month
  const firstDayBsStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`
  const firstDayAdStr = BSToAD(firstDayBsStr)
  const firstDayAd = new Date(firstDayAdStr)
  const startDayOfWeek = firstDayAd.getDay() // 0=Sun

  // Get AD date range for header
  const lastDayBsStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`
  const lastDayAd = new Date(BSToAD(lastDayBsStr))

  const adM1 = AD_MONTHS[firstDayAd.getMonth()]
  const adM2 = AD_MONTHS[lastDayAd.getMonth()]
  const adY1 = firstDayAd.getFullYear()
  const adY2 = lastDayAd.getFullYear()

  const adHeaderStr =
    adM1 === adM2 && adY1 === adY2
      ? `${adM1} ${adY1}`
      : adY1 === adY2
      ? `${adM1} / ${adM2} ${adY1}`
      : `${adM1} ${adY1} / ${adM2} ${adY2}`

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1)
      setCurrentMonth(12)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1)
      setCurrentMonth(1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  // Build grid
  const cells: ({ bsDay: number; adDay: number } | null)[] = [
    ...Array(startDayOfWeek).fill(null),
  ]

  for (let d = 1; d <= daysInMonth; d++) {
    const bsStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    const adDate = new Date(BSToAD(bsStr))
    cells.push({ bsDay: d, adDay: adDate.getDate() })
  }

  while (cells.length % 7 !== 0) cells.push(null)

  const isToday = (bsDay: number) =>
    bsDay === tD && currentMonth === tM && currentYear === tY

  const getHoliday = (bsDay: number) => {
    const key = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(bsDay).padStart(2, "0")}`
    return ALL_HOLIDAYS[key]
  }

  return (
    <div className="bg-white border border-gray-200 overflow-hidden font-poppins shadow-sm">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)" }}
      >
        <div>
          <div className="text-white font-bold text-base md:text-lg font-nepali-serif">क्यालेन्डर</div>
          <div className="text-white/90 text-xs md:text-sm font-nepali-serif font-semibold mt-0.5">
            {BS_MONTH_NAMES[currentMonth - 1]} {toNepaliNumeral(currentYear)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-xs font-poppins font-medium bg-white/10 px-2 py-1 rounded">
            {adHeaderStr}
          </span>
          <button
            onClick={prevMonth}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            onClick={nextMonth}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {DAY_NAMES_SHORT.map((d, i) => (
          <div
            key={d}
            className={`text-center py-2 text-xs font-bold font-nepali-serif ${
              i === 6 ? "text-nepal-red" : "text-gray-600"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-50">
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`empty-${idx}`} className="aspect-square bg-gray-50/30" />

          const isT = isToday(cell.bsDay)
          const holiday = getHoliday(cell.bsDay)
          const isSat = idx % 7 === 6

          return (
            <div
              key={cell.bsDay}
              title={holiday || undefined}
              className={`
                aspect-square flex flex-col items-center justify-center relative p-1
                ${isT ? "bg-[#4F46E5] text-white" : "hover:bg-gray-50 text-gray-800"}
                transition-colors cursor-default
              `}
            >
              {/* Main BS Day Number (Nepali) */}
              <span
                className={`font-bold font-nepali-serif leading-none ${
                  compact ? "text-sm md:text-base" : "text-base md:text-lg"
                } ${isSat && !isT ? "text-nepal-red" : ""}`}
              >
                {toNepaliNumeral(cell.bsDay)}
              </span>

              {/* Small AD Day Number (English) */}
              <span
                className={`text-[10px] md:text-[11px] font-poppins mt-0.5 leading-none ${
                  isT ? "text-white/80" : "text-gray-400"
                }`}
              >
                {cell.adDay}
              </span>

              {/* Holiday indicator dot */}
              {holiday && (
                <span
                  className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                    isT ? "bg-white" : "bg-nepal-red"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


