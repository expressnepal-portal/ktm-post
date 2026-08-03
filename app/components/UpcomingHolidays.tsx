"use client"

// Public holidays for BS 2082/2083 with AD equivalent dates
// Days remaining is computed client-side
import { useEffect, useState } from "react"

interface Holiday {
  bsDate: string    // "भाद्र १२, २०८३"
  adDate: string    // "Aug 28, 2026" — used for countdown
  name: string
  bsDay: number
  bsDayNepali: string
  dayOfWeek: string // "शुक्र"
}

const toNepaliNumeral = (n: number): string => {
  const digits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]
  return String(n).split("").map((d) => digits[parseInt(d)]).join("")
}

const UPCOMING_HOLIDAYS: (Holiday & { adTimestamp: number })[] = [
  {
    bsDate: "भाद्र १२, २०८३",
    adDate: "Aug 28, 2026",
    adTimestamp: new Date("2026-08-28").getTime(),
    name: "जनै पूर्णिमा",
    bsDay: 12,
    bsDayNepali: "१२",
    dayOfWeek: "शुक्र",
  },
  {
    bsDate: "भाद्र १९, २०८३",
    adDate: "Sep 4, 2026",
    adTimestamp: new Date("2026-09-04").getTime(),
    name: "श्रीकृष्ण जन्माष्टमी व्रत",
    bsDay: 19,
    bsDayNepali: "१९",
    dayOfWeek: "शुक्र",
  },
  {
    bsDate: "असोज ३, २०८३",
    adDate: "Sep 19, 2026",
    adTimestamp: new Date("2026-09-19").getTime(),
    name: "संविधान दिवस",
    bsDay: 3,
    bsDayNepali: "३",
    dayOfWeek: "शनि",
  },
  {
    bsDate: "असोज २५, २०८३",
    adDate: "Oct 11, 2026",
    adTimestamp: new Date("2026-10-11").getTime(),
    name: "घटस्थापना",
    bsDay: 25,
    bsDayNepali: "२५",
    dayOfWeek: "आइत",
  },
  {
    bsDate: "असोज ३१, २०८३",
    adDate: "Oct 17, 2026",
    adTimestamp: new Date("2026-10-17").getTime(),
    name: "फूलपाती",
    bsDay: 31,
    bsDayNepali: "३१",
    dayOfWeek: "शनि",
  },
  {
    bsDate: "कार्तिक ५, २०८३",
    adDate: "Oct 22, 2026",
    adTimestamp: new Date("2026-10-22").getTime(),
    name: "लक्ष्मी पूजा",
    bsDay: 5,
    bsDayNepali: "५",
    dayOfWeek: "बिहि",
  },
]

function getDaysRemaining(timestamp: number): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const diff = Math.ceil((timestamp - today) / 86400000)
  if (diff === 0) return "आज"
  if (diff === 1) return "भोलि"
  if (diff < 30) return `${toNepaliNumeral(diff)} दिन बाँकी`
  const months = Math.floor(diff / 30)
  return `${toNepaliNumeral(months)} महिना बाँकी`
}

export default function UpcomingHolidays({ maxItems = 5 }: { maxItems?: number }) {
  const [now, setNow] = useState(0)
  useEffect(() => { setNow(Date.now()) }, [])

  const upcoming = UPCOMING_HOLIDAYS.filter(h => h.adTimestamp >= now - 86400000).slice(0, maxItems)

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <span className="text-nepal-red text-lg">📅</span>
        <h3 className="font-nepali-serif font-bold text-base text-nepal-black">आगामी बिदाहरु</h3>
      </div>

      {/* Holiday list */}
      <div className="divide-y divide-gray-100">
        {upcoming.map((h) => {
          const daysLeft = now ? getDaysRemaining(h.adTimestamp) : ""
          return (
            <div key={h.name} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
              {/* Date box */}
              <div className="flex-shrink-0 w-10 h-10 border border-gray-200 flex flex-col items-center justify-center text-center rounded-sm">
                <span className="font-nepali-serif font-bold text-sm text-nepal-black leading-none">
                  {h.bsDayNepali}
                </span>
                <span className="text-gray-500 text-[9px] font-poppins leading-none mt-0.5">
                  {h.dayOfWeek}
                </span>
              </div>

              {/* Name + date */}
              <div className="flex-1 min-w-0">
                <p className="font-nepali-serif font-bold text-sm text-gray-900 leading-snug">{h.name}</p>
                <p className="text-xs text-gray-500 font-poppins mt-0.5">
                  {h.bsDate} - {h.adDate}
                </p>
              </div>

              {/* Days badge */}
              {daysLeft && (
                <span className="flex-shrink-0 text-[10px] font-poppins font-semibold text-nepal-red bg-red-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {daysLeft}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
