"use client";

import { useEffect, useState } from "react";
import NepaliDate from "bikram-sambat-js";
// import { CalendarDays, Clock4 } from "lucide-react";
// import Clock from "./Clock";

// Nepali digits
const toNepaliDigits = (num: number | string) => {
  const nepali = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return num.toString().replace(/\d/g, (d) => nepali[parseInt(d)]);
};

const nepaliWeekdays = [
  "आइतवार",
  "सोमवार",
  "मङ्गलवार",
  "बुधवार",
  "बिहिवार",
  "शुक्रवार",
  "शनिवार",
];

const nepaliMonths = [
  "बैशाख",
  "जेठ",
  "असार",
  "श्रावण",
  "भदौ",
  "आश्विन",
  "कार्तिक",
  "मंसिर",
  "पौष",
  "माघ",
  "फाल्गुण",
  "चैत्र",
];

export default function NepaliClock() {
  const [dateText, setDateText] = useState("");

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const bsDate = new NepaliDate(now);
      const bsDateString = bsDate.toBS();
      const [bsYear, bsMonth, bsDay] = bsDateString.split("-").map(Number);
      const weekday = nepaliWeekdays[now.getDay()];
      const day = toNepaliDigits(bsDay);
      const month = nepaliMonths[bsMonth - 1] || "";
      const year = toNepaliDigits(bsYear);

      setDateText(`${day} ${month} ${year}, ${weekday}`);
    };

    updateDate();
  }, []);

  if (!dateText) return null;

  return (
    <span className="text-gray-600 font-nepali-serif text-xs sm:text-sm font-medium tracking-wide block">
      {dateText}
    </span>
  );
}
