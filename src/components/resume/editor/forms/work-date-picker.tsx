"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1950 + 4 }, (_, i) =>
  (CURRENT_YEAR + 3 - i).toString()
);

export type DateFormat =
  | "MMM 'YY"
  | "MMM YYYY"
  | "MMMM YYYY"
  | "MM/YYYY"
  | "YYYY";

const FORMAT_OPTIONS: { value: DateFormat; label: string }[] = [
  { value: "MMM 'YY", label: "JUL '25" },
  { value: "MMM YYYY", label: "Jul 2025" },
  { value: "MMMM YYYY", label: "July 2025" },
  { value: "MM/YYYY", label: "07/2025" },
  { value: "YYYY", label: "2025" },
];

interface ParsedDate {
  month: string;
  year: string;
  format: DateFormat;
}

function parseMonthYear(part: string): ParsedDate | null {
  const trimmed = part.trim();
  if (!trimmed) return null;

  // Year only: "2025"
  if (/^\d{4}$/.test(trimmed)) {
    return { month: "", year: trimmed, format: "YYYY" };
  }

  // MM/YYYY: "07/2025"
  const mmYyyy = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
  if (mmYyyy) {
    return {
      month: mmYyyy[1].padStart(2, "0"),
      year: mmYyyy[2],
      format: "MM/YYYY",
    };
  }

  // MMM 'YY: "JUL '25" or "Jul '25"
  const mmmApos = trimmed.match(/^([A-Za-z]{3})\s+'(\d{2})$/);
  if (mmmApos) {
    const idx = MONTHS_SHORT.findIndex(
      (m) => m.toLowerCase() === mmmApos[1].toLowerCase()
    );
    return {
      month: idx >= 0 ? (idx + 1).toString().padStart(2, "0") : "",
      year: idx >= 0 ? `20${mmmApos[2]}` : "",
      format: "MMM 'YY",
    };
  }

  // Full month + year: "July 2025" or "Jul 2025"
  const monthYear = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYear) {
    const fullIdx = MONTHS_FULL.findIndex(
      (m) => m.toLowerCase() === monthYear[1].toLowerCase()
    );
    if (fullIdx >= 0) {
      return {
        month: (fullIdx + 1).toString().padStart(2, "0"),
        year: monthYear[2],
        format: "MMMM YYYY",
      };
    }
    const shortIdx = MONTHS_SHORT.findIndex(
      (m) => m.toLowerCase() === monthYear[1].toLowerCase()
    );
    if (shortIdx >= 0) {
      return {
        month: (shortIdx + 1).toString().padStart(2, "0"),
        year: monthYear[2],
        format: "MMM YYYY",
      };
    }
  }

  return null;
}

function formatSingleDate(
  month: string,
  year: string,
  format: DateFormat
): string {
  if (!year) return "";
  if (!month || format === "YYYY") return year;

  const m = parseInt(month) - 1;
  if (m < 0 || m > 11) return year;

  switch (format) {
    case "MMM 'YY":
      return `${MONTHS_SHORT[m].toUpperCase()} '${year.slice(-2)}`;
    case "MMM YYYY":
      return `${MONTHS_SHORT[m]} ${year}`;
    case "MMMM YYYY":
      return `${MONTHS_FULL[m]} ${year}`;
    case "MM/YYYY":
      return `${month}/${year}`;
    default:
      return year;
  }
}

function composeDate(
  startMonth: string,
  startYear: string,
  endMonth: string,
  endYear: string,
  isCurrent: boolean,
  format: DateFormat
): string {
  const startStr = formatSingleDate(startMonth, startYear, format);
  let endStr: string;
  if (isCurrent) {
    endStr = format === "MMM 'YY" ? "PRESENT" : "Present";
  } else {
    endStr = formatSingleDate(endMonth, endYear, format);
  }

  if (startStr && endStr) return `${startStr} - ${endStr}`;
  if (startStr) return startStr;
  if (endStr) return endStr;
  return "";
}

interface WorkDatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function WorkDatePicker({ value, onChange }: WorkDatePickerProps) {
  const lastEmittedRef = useRef<string>("");

  const parseValue = useCallback((raw: string) => {
    const isCurrent = /present|current|now/i.test(raw);
    const separator = /\s*[–—-]\s*/;
    const parts = raw.split(separator).map((p) => p.trim());

    const startParsed = parts[0] ? parseMonthYear(parts[0]) : null;
    const endRaw = parts[1] ?? "";
    const endParsed = !isCurrent && endRaw ? parseMonthYear(endRaw) : null;

    const detectedFormat: DateFormat =
      startParsed?.format ?? endParsed?.format ?? "MMM YYYY";

    return {
      startMonth: startParsed?.month ?? "",
      startYear: startParsed?.year ?? "",
      endMonth: endParsed?.month ?? "",
      endYear: endParsed?.year ?? "",
      isCurrent,
      format: detectedFormat,
    };
  }, []);

  const initial = parseValue(value);
  const [startMonth, setStartMonth] = useState(initial.startMonth);
  const [startYear, setStartYear] = useState(initial.startYear);
  const [endMonth, setEndMonth] = useState(initial.endMonth);
  const [endYear, setEndYear] = useState(initial.endYear);
  const [isCurrent, setIsCurrent] = useState(initial.isCurrent);
  const [format, setFormat] = useState<DateFormat>(initial.format);

  // Sync when external value changes (e.g., AI fills the field)
  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    const parsed = parseValue(value);
    setStartMonth(parsed.startMonth);
    setStartYear(parsed.startYear);
    setEndMonth(parsed.endMonth);
    setEndYear(parsed.endYear);
    setIsCurrent(parsed.isCurrent);
    setFormat(parsed.format);
  }, [value, parseValue]);

  // Emit whenever state changes
  useEffect(() => {
    const composed = composeDate(
      startMonth,
      startYear,
      endMonth,
      endYear,
      isCurrent,
      format
    );
    if (composed !== lastEmittedRef.current) {
      lastEmittedRef.current = composed;
      onChange(composed);
    }
  }, [startMonth, startYear, endMonth, endYear, isCurrent, format, onChange]);

  const preview = composeDate(
    startMonth,
    startYear,
    endMonth,
    endYear,
    isCurrent,
    format
  );

  const triggerCls = cn(
    "h-7 text-[11px] border-gray-200 bg-white/50 text-gray-700",
    "hover:border-gray-300 focus:border-gray-400 focus:ring-0",
    "transition-colors shadow-none"
  );

  return (
    <div className="space-y-2">
      {/* Start / End row */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {/* FROM */}
        <div className="space-y-1">
          <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">
            From
          </span>
          <div className="flex gap-1">
            {format !== "YYYY" && (
              <Select value={startMonth} onValueChange={setStartMonth}>
                <SelectTrigger className={cn(triggerCls, "flex-1 min-w-0")}>
                  <SelectValue placeholder="Mon" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS_SHORT.map((m, i) => (
                    <SelectItem
                      key={m}
                      value={(i + 1).toString().padStart(2, "0")}
                    >
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={startYear} onValueChange={setStartYear}>
              <SelectTrigger
                className={cn(
                  triggerCls,
                  format === "YYYY" ? "w-full" : "w-[72px]"
                )}
              >
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* TO */}
        <div className="space-y-1">
          <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">
            To
          </span>
          {isCurrent ? (
            <div className="flex items-center h-7 px-2 rounded-md border border-gray-200 bg-gray-50">
              <span className="text-[11px] text-gray-400 italic">Present</span>
            </div>
          ) : (
            <div className="flex gap-1">
              {format !== "YYYY" && (
                <Select value={endMonth} onValueChange={setEndMonth}>
                  <SelectTrigger className={cn(triggerCls, "flex-1 min-w-0")}>
                    <SelectValue placeholder="Mon" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS_SHORT.map((m, i) => (
                      <SelectItem
                        key={m}
                        value={(i + 1).toString().padStart(2, "0")}
                      >
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={endYear} onValueChange={setEndYear}>
                <SelectTrigger
                  className={cn(
                    triggerCls,
                    format === "YYYY" ? "w-full" : "w-[72px]"
                  )}
                >
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Current checkbox + format selector */}
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Checkbox
            checked={isCurrent}
            onCheckedChange={(checked) => setIsCurrent(!!checked)}
            className="h-3.5 w-3.5"
          />
          <span className="text-[11px] text-gray-500 select-none">
            Current job
          </span>
        </label>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-gray-400 uppercase tracking-wide">
            Format
          </span>
          <Select
            value={format}
            onValueChange={(v) => setFormat(v as DateFormat)}
          >
            <SelectTrigger className={cn(triggerCls, "w-[88px]")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {FORMAT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <p className="text-[10px] text-gray-400">
          Preview: <span className="text-gray-600 font-medium">{preview}</span>
        </p>
      )}
    </div>
  );
}
