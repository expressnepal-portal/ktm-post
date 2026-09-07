// Server component — fetches NRB forex data at render time (no CORS issues)

interface ForexRate {
  currency: { iso3: string; name: string; unit: number }
  buy: string
  sell: string
}

interface NRBResponse {
  data: {
    payload: Array<{
      rates: ForexRate[]
      date: string
    }>
  }
}

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  JPY: "🇯🇵",
  SAR: "🇸🇦",
  SGD: "🇸🇬",
  QAR: "🇶🇦",
  THB: "🇹🇭",
  AED: "🇦🇪",
  INR: "🇮🇳",
  MYR: "🇲🇾",
  KRW: "🇰🇷",
  HKD: "🇭🇰",
  SEK: "🇸🇪",
  DKK: "🇩🇰",
  NOK: "🇳🇴",
}

const CURRENCY_NEPALI: Record<string, string> = {
  USD: "अमेरिकी डलर",
  EUR: "युरोपेली युरो",
  GBP: "बेलायती पाउन्ड",
  AUD: "अस्ट्रेलियन डलर",
  CAD: "क्यानाडियन डलर",
  CHF: "स्विस फ्रेन्क",
  CNY: "चिनियाँ युआन",
  JPY: "जापानी येन",
  SAR: "साउदी रियाल",
  SGD: "सिंगापुर डलर",
  QAR: "कतारी रियाल",
  THB: "थाई बाट",
  AED: "युएई दिर्हम",
  INR: "भारतीय रुपैयाँ",
}

// Gold/Silver rates (static for now — NRB updates daily)
interface MetalRate {
  name: string
  nameNepali: string
  unit: string
  unitNepali: string
  price: number
}

const GOLD_SILVER_RATES: MetalRate[] = [
  { name: "Gold Hallmark", nameNepali: "सुन हलमार्क", unit: "Tola", unitNepali: "तोला", price: 284000 },
  { name: "Gold Tajabi", nameNepali: "सुन तजबी", unit: "Tola", unitNepali: "तोला", price: 281200 },
  { name: "Silver", nameNepali: "चाँदी", unit: "Tola", unitNepali: "तोला", price: 4350 },
  { name: "Gold Hallmark", nameNepali: "सुन हलमार्क", unit: "10 gram", unitNepali: "१० ग्राम", price: 243485 },
  { name: "Gold Tajabi", nameNepali: "सुन तजबी", unit: "10 gram", unitNepali: "१० ग्राम", price: 241050 },
  { name: "Silver", nameNepali: "चाँदी", unit: "10 gram", unitNepali: "१० ग्राम", price: 3730 },
]

// Which currencies to show (prioritized)
const SHOW_CURRENCIES = ["USD", "EUR", "GBP", "AUD", "CAD", "CHF", "CNY", "JPY", "SAR", "SGD", "QAR", "THB", "AED"]

async function fetchForexRates(): Promise<{ rates: ForexRate[]; date: string } | null> {
  try {
    const today = new Date()
    const dateStr = today.toISOString().split("T")[0]
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 3)
    const fromStr = yesterday.toISOString().split("T")[0]

    const url = `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=20&from=${fromStr}&to=${dateStr}`
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // cache 1 hour
      headers: { "Accept": "application/json" },
    })
    if (!res.ok) return null
    const json: NRBResponse = await res.json()
    const payload = json?.data?.payload?.[0]
    if (!payload) return null
    return { rates: payload.rates, date: payload.date }
  } catch {
    return null
  }
}

function formatPrice(n: number): string {
  return n.toLocaleString("en-IN")
}

export default async function ForexRatesWidget() {
  const forexData = await fetchForexRates()

  const displayDate = forexData?.date
    ? new Date(forexData.date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })

  const filteredRates = forexData?.rates.filter((r) =>
    SHOW_CURRENCIES.includes(r.currency.iso3)
  ) ?? []

  // Sort by SHOW_CURRENCIES order
  filteredRates.sort((a, b) =>
    SHOW_CURRENCIES.indexOf(a.currency.iso3) - SHOW_CURRENCIES.indexOf(b.currency.iso3)
  )

  return (
    <div className="flex flex-col gap-10 border border-gray-200 w-full overflow-hidden bg-white">
      {/* ── FOREX TABLE ── */}
      <div className="border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 text-center border-b border-gray-200"
          style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}>
          <h3 className="text-white font-bold font-nepali-serif text-base">विनिमय दर</h3>
          <p className="text-white/80 text-xs font-poppins mt-0.5">{displayDate}</p>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] text-xs font-bold text-gray-500 uppercase tracking-wide px-3 py-2 bg-gray-50 border-b border-gray-100 font-poppins">
          <span>मुद्रा</span>
          <span className="w-8 text-center">Unit</span>
          <span className="w-14 text-right">किन्ने</span>
          <span className="w-14 text-right">बेच्ने</span>
        </div>

        {/* Rates */}
        <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto scrollbar-hide">
          {filteredRates.length > 0 ? (
            filteredRates.map((r) => (
              <div
                key={r.currency.iso3}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{CURRENCY_FLAGS[r.currency.iso3] ?? "🏳"}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 font-nepali-serif truncate">
                      {CURRENCY_NEPALI[r.currency.iso3] ?? r.currency.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-poppins">{r.currency.iso3}</p>
                  </div>
                </div>
                <span className="w-8 text-center text-xs text-gray-400 font-poppins">{r.currency.unit}</span>
                <span className="w-14 text-right text-xs font-semibold text-gray-700 font-poppins">{parseFloat(r.buy).toFixed(2)}</span>
                <span className="w-14 text-right text-xs font-semibold text-gray-700 font-poppins">{parseFloat(r.sell).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-gray-400 text-sm font-poppins">
              दर उपलब्ध छैन
            </div>
          )}
        </div>
      </div>

      {/* ── GOLD & SILVER ── */}
      <div>
        {/* Header */}
        <div className="px-4 py-3 text-center border-b border-gray-200"
          style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
          <h3 className="text-white font-bold font-nepali-serif text-base">सुन/चाँदी मूल्य</h3>
          <p className="text-white/80 text-xs font-poppins mt-0.5">{displayDate}</p>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto] text-xs font-bold text-gray-500 uppercase tracking-wide px-3 py-2 bg-gray-50 border-b border-gray-100 font-poppins">
          <span>वस्तु</span>
          <span className="w-16 text-center">एकाइ</span>
          <span className="w-20 text-right">मूल्य (रु.)</span>
        </div>

        {/* Rates */}
        <div className="divide-y divide-gray-50">
          {GOLD_SILVER_RATES.map((m, i) => (
            <div key={`${m.name}-${m.unit}`} className="grid grid-cols-[1fr_auto_auto] items-center px-3 py-2.5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm shrink-0">{m.name === "Silver" ? "🥈" : "🥇"}</span>
                <span className="text-xs font-semibold text-gray-800 font-nepali-serif">{m.nameNepali}</span>
              </div>
              <span className="w-16 text-center text-xs text-gray-400 font-poppins">{m.unitNepali}</span>
              <span className="w-20 text-right text-xs font-bold text-amber-700 font-poppins">
                {formatPrice(m.price)}
              </span>
            </div>
          ))}
        </div>

        {/* NRB attribution */}
        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
          <p className="text-[10px] text-gray-400 font-poppins text-center">
            स्रोत: नेपाल राष्ट्र बैंक (NRB)
          </p>
        </div>
      </div>
    </div>
  )
}
