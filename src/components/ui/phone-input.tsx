"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FORM_INPUT_CLASS } from "@/components/ui/form-field";

interface Country {
  name: string;
  iso: string;
  code: string;
}

const COUNTRIES: Country[] = [
  { name: "Afghanistan", iso: "AF", code: "+93" },
  { name: "Albania", iso: "AL", code: "+355" },
  { name: "Algeria", iso: "DZ", code: "+213" },
  { name: "Andorra", iso: "AD", code: "+376" },
  { name: "Angola", iso: "AO", code: "+244" },
  { name: "Antigua and Barbuda", iso: "AG", code: "+1-268" },
  { name: "Argentina", iso: "AR", code: "+54" },
  { name: "Armenia", iso: "AM", code: "+374" },
  { name: "Australia", iso: "AU", code: "+61" },
  { name: "Austria", iso: "AT", code: "+43" },
  { name: "Azerbaijan", iso: "AZ", code: "+994" },
  { name: "Bahamas", iso: "BS", code: "+1-242" },
  { name: "Bahrain", iso: "BH", code: "+973" },
  { name: "Bangladesh", iso: "BD", code: "+880" },
  { name: "Barbados", iso: "BB", code: "+1-246" },
  { name: "Belarus", iso: "BY", code: "+375" },
  { name: "Belgium", iso: "BE", code: "+32" },
  { name: "Belize", iso: "BZ", code: "+501" },
  { name: "Benin", iso: "BJ", code: "+229" },
  { name: "Bhutan", iso: "BT", code: "+975" },
  { name: "Bolivia", iso: "BO", code: "+591" },
  { name: "Bosnia and Herzegovina", iso: "BA", code: "+387" },
  { name: "Botswana", iso: "BW", code: "+267" },
  { name: "Brazil", iso: "BR", code: "+55" },
  { name: "Brunei", iso: "BN", code: "+673" },
  { name: "Bulgaria", iso: "BG", code: "+359" },
  { name: "Burkina Faso", iso: "BF", code: "+226" },
  { name: "Burundi", iso: "BI", code: "+257" },
  { name: "Cabo Verde", iso: "CV", code: "+238" },
  { name: "Cambodia", iso: "KH", code: "+855" },
  { name: "Cameroon", iso: "CM", code: "+237" },
  { name: "Canada", iso: "CA", code: "+1" },
  { name: "Central African Republic", iso: "CF", code: "+236" },
  { name: "Chad", iso: "TD", code: "+235" },
  { name: "Chile", iso: "CL", code: "+56" },
  { name: "China", iso: "CN", code: "+86" },
  { name: "Colombia", iso: "CO", code: "+57" },
  { name: "Comoros", iso: "KM", code: "+269" },
  { name: "Congo (DRC)", iso: "CD", code: "+243" },
  { name: "Congo (Republic)", iso: "CG", code: "+242" },
  { name: "Costa Rica", iso: "CR", code: "+506" },
  { name: "Croatia", iso: "HR", code: "+385" },
  { name: "Cuba", iso: "CU", code: "+53" },
  { name: "Cyprus", iso: "CY", code: "+357" },
  { name: "Czech Republic", iso: "CZ", code: "+420" },
  { name: "Denmark", iso: "DK", code: "+45" },
  { name: "Djibouti", iso: "DJ", code: "+253" },
  { name: "Dominica", iso: "DM", code: "+1-767" },
  { name: "Dominican Republic", iso: "DO", code: "+1-809" },
  { name: "Ecuador", iso: "EC", code: "+593" },
  { name: "Egypt", iso: "EG", code: "+20" },
  { name: "El Salvador", iso: "SV", code: "+503" },
  { name: "Equatorial Guinea", iso: "GQ", code: "+240" },
  { name: "Eritrea", iso: "ER", code: "+291" },
  { name: "Estonia", iso: "EE", code: "+372" },
  { name: "Eswatini", iso: "SZ", code: "+268" },
  { name: "Ethiopia", iso: "ET", code: "+251" },
  { name: "Fiji", iso: "FJ", code: "+679" },
  { name: "Finland", iso: "FI", code: "+358" },
  { name: "France", iso: "FR", code: "+33" },
  { name: "Gabon", iso: "GA", code: "+241" },
  { name: "Gambia", iso: "GM", code: "+220" },
  { name: "Georgia", iso: "GE", code: "+995" },
  { name: "Germany", iso: "DE", code: "+49" },
  { name: "Ghana", iso: "GH", code: "+233" },
  { name: "Greece", iso: "GR", code: "+30" },
  { name: "Grenada", iso: "GD", code: "+1-473" },
  { name: "Guatemala", iso: "GT", code: "+502" },
  { name: "Guinea", iso: "GN", code: "+224" },
  { name: "Guinea-Bissau", iso: "GW", code: "+245" },
  { name: "Guyana", iso: "GY", code: "+592" },
  { name: "Haiti", iso: "HT", code: "+509" },
  { name: "Honduras", iso: "HN", code: "+504" },
  { name: "Hungary", iso: "HU", code: "+36" },
  { name: "Iceland", iso: "IS", code: "+354" },
  { name: "India", iso: "IN", code: "+91" },
  { name: "Indonesia", iso: "ID", code: "+62" },
  { name: "Iran", iso: "IR", code: "+98" },
  { name: "Iraq", iso: "IQ", code: "+964" },
  { name: "Ireland", iso: "IE", code: "+353" },
  { name: "Israel", iso: "IL", code: "+972" },
  { name: "Italy", iso: "IT", code: "+39" },
  { name: "Jamaica", iso: "JM", code: "+1-876" },
  { name: "Japan", iso: "JP", code: "+81" },
  { name: "Jordan", iso: "JO", code: "+962" },
  { name: "Kazakhstan", iso: "KZ", code: "+7" },
  { name: "Kenya", iso: "KE", code: "+254" },
  { name: "Kiribati", iso: "KI", code: "+686" },
  { name: "Kuwait", iso: "KW", code: "+965" },
  { name: "Kyrgyzstan", iso: "KG", code: "+996" },
  { name: "Laos", iso: "LA", code: "+856" },
  { name: "Latvia", iso: "LV", code: "+371" },
  { name: "Lebanon", iso: "LB", code: "+961" },
  { name: "Lesotho", iso: "LS", code: "+266" },
  { name: "Liberia", iso: "LR", code: "+231" },
  { name: "Libya", iso: "LY", code: "+218" },
  { name: "Liechtenstein", iso: "LI", code: "+423" },
  { name: "Lithuania", iso: "LT", code: "+370" },
  { name: "Luxembourg", iso: "LU", code: "+352" },
  { name: "Madagascar", iso: "MG", code: "+261" },
  { name: "Malawi", iso: "MW", code: "+265" },
  { name: "Malaysia", iso: "MY", code: "+60" },
  { name: "Maldives", iso: "MV", code: "+960" },
  { name: "Mali", iso: "ML", code: "+223" },
  { name: "Malta", iso: "MT", code: "+356" },
  { name: "Marshall Islands", iso: "MH", code: "+692" },
  { name: "Mauritania", iso: "MR", code: "+222" },
  { name: "Mauritius", iso: "MU", code: "+230" },
  { name: "Mexico", iso: "MX", code: "+52" },
  { name: "Micronesia", iso: "FM", code: "+691" },
  { name: "Moldova", iso: "MD", code: "+373" },
  { name: "Monaco", iso: "MC", code: "+377" },
  { name: "Mongolia", iso: "MN", code: "+976" },
  { name: "Montenegro", iso: "ME", code: "+382" },
  { name: "Morocco", iso: "MA", code: "+212" },
  { name: "Mozambique", iso: "MZ", code: "+258" },
  { name: "Myanmar", iso: "MM", code: "+95" },
  { name: "Namibia", iso: "NA", code: "+264" },
  { name: "Nauru", iso: "NR", code: "+674" },
  { name: "Nepal", iso: "NP", code: "+977" },
  { name: "Netherlands", iso: "NL", code: "+31" },
  { name: "New Zealand", iso: "NZ", code: "+64" },
  { name: "Nicaragua", iso: "NI", code: "+505" },
  { name: "Niger", iso: "NE", code: "+227" },
  { name: "Nigeria", iso: "NG", code: "+234" },
  { name: "North Korea", iso: "KP", code: "+850" },
  { name: "North Macedonia", iso: "MK", code: "+389" },
  { name: "Norway", iso: "NO", code: "+47" },
  { name: "Oman", iso: "OM", code: "+968" },
  { name: "Pakistan", iso: "PK", code: "+92" },
  { name: "Palau", iso: "PW", code: "+680" },
  { name: "Palestine", iso: "PS", code: "+970" },
  { name: "Panama", iso: "PA", code: "+507" },
  { name: "Papua New Guinea", iso: "PG", code: "+675" },
  { name: "Paraguay", iso: "PY", code: "+595" },
  { name: "Peru", iso: "PE", code: "+51" },
  { name: "Philippines", iso: "PH", code: "+63" },
  { name: "Poland", iso: "PL", code: "+48" },
  { name: "Portugal", iso: "PT", code: "+351" },
  { name: "Qatar", iso: "QA", code: "+974" },
  { name: "Romania", iso: "RO", code: "+40" },
  { name: "Russia", iso: "RU", code: "+7" },
  { name: "Rwanda", iso: "RW", code: "+250" },
  { name: "Saint Kitts and Nevis", iso: "KN", code: "+1-869" },
  { name: "Saint Lucia", iso: "LC", code: "+1-758" },
  { name: "Saint Vincent and the Grenadines", iso: "VC", code: "+1-784" },
  { name: "Samoa", iso: "WS", code: "+685" },
  { name: "San Marino", iso: "SM", code: "+378" },
  { name: "Sao Tome and Principe", iso: "ST", code: "+239" },
  { name: "Saudi Arabia", iso: "SA", code: "+966" },
  { name: "Senegal", iso: "SN", code: "+221" },
  { name: "Serbia", iso: "RS", code: "+381" },
  { name: "Seychelles", iso: "SC", code: "+248" },
  { name: "Sierra Leone", iso: "SL", code: "+232" },
  { name: "Singapore", iso: "SG", code: "+65" },
  { name: "Slovakia", iso: "SK", code: "+421" },
  { name: "Slovenia", iso: "SI", code: "+386" },
  { name: "Solomon Islands", iso: "SB", code: "+677" },
  { name: "Somalia", iso: "SO", code: "+252" },
  { name: "South Africa", iso: "ZA", code: "+27" },
  { name: "South Korea", iso: "KR", code: "+82" },
  { name: "South Sudan", iso: "SS", code: "+211" },
  { name: "Spain", iso: "ES", code: "+34" },
  { name: "Sri Lanka", iso: "LK", code: "+94" },
  { name: "Sudan", iso: "SD", code: "+249" },
  { name: "Suriname", iso: "SR", code: "+597" },
  { name: "Sweden", iso: "SE", code: "+46" },
  { name: "Switzerland", iso: "CH", code: "+41" },
  { name: "Syria", iso: "SY", code: "+963" },
  { name: "Taiwan", iso: "TW", code: "+886" },
  { name: "Tajikistan", iso: "TJ", code: "+992" },
  { name: "Tanzania", iso: "TZ", code: "+255" },
  { name: "Thailand", iso: "TH", code: "+66" },
  { name: "Timor-Leste", iso: "TL", code: "+670" },
  { name: "Togo", iso: "TG", code: "+228" },
  { name: "Tonga", iso: "TO", code: "+676" },
  { name: "Trinidad and Tobago", iso: "TT", code: "+1-868" },
  { name: "Tunisia", iso: "TN", code: "+216" },
  { name: "Turkey", iso: "TR", code: "+90" },
  { name: "Turkmenistan", iso: "TM", code: "+993" },
  { name: "Tuvalu", iso: "TV", code: "+688" },
  { name: "Uganda", iso: "UG", code: "+256" },
  { name: "Ukraine", iso: "UA", code: "+380" },
  { name: "United Arab Emirates", iso: "AE", code: "+971" },
  { name: "United Kingdom", iso: "GB", code: "+44" },
  { name: "United States", iso: "US", code: "+1" },
  { name: "Uruguay", iso: "UY", code: "+598" },
  { name: "Uzbekistan", iso: "UZ", code: "+998" },
  { name: "Vanuatu", iso: "VU", code: "+678" },
  { name: "Vatican City", iso: "VA", code: "+39" },
  { name: "Venezuela", iso: "VE", code: "+58" },
  { name: "Vietnam", iso: "VN", code: "+84" },
  { name: "Yemen", iso: "YE", code: "+967" },
  { name: "Zambia", iso: "ZM", code: "+260" },
  { name: "Zimbabwe", iso: "ZW", code: "+263" },
];

function getFlag(iso: string): string {
  return [...iso.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

function parsePhoneValue(value: string): {
  countryCode: string;
  localNumber: string;
} {
  if (!value) return { countryCode: "+1", localNumber: "" };
  if (!value.startsWith("+")) return { countryCode: "+1", localNumber: value };

  // Sort by code length descending so longer codes match first (e.g. +1-268 before +1)
  const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  for (const c of sorted) {
    if (value.startsWith(c.code + " ") || value === c.code) {
      return {
        countryCode: c.code,
        localNumber: value.slice(c.code.length).trimStart(),
      };
    }
  }
  // Fallback: assume first token is code
  const spaceIdx = value.indexOf(" ");
  if (spaceIdx !== -1) {
    return {
      countryCode: value.slice(0, spaceIdx),
      localNumber: value.slice(spaceIdx + 1),
    };
  }
  return { countryCode: value, localNumber: "" };
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "555 000 0000",
  className,
}: PhoneInputProps) {
  const parsed = useMemo(() => parsePhoneValue(value), [value]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedCountry =
    COUNTRIES.find((c) => c.code === parsed.countryCode) ??
    COUNTRIES.find((c) => c.iso === "US")!;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [search]);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  function handleCountrySelect(country: Country) {
    onChange(
      country.code + (parsed.localNumber ? " " + parsed.localNumber : "")
    );
    setOpen(false);
  }

  function handleLocalNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const local = e.target.value;
    onChange(parsed.countryCode + (local ? " " + local : ""));
  }

  return (
    <div className={cn("flex gap-1.5", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "h-8 border border-gray-200 bg-white rounded-md text-sm focus:border-gray-400 focus:outline-none",
              "flex items-center gap-1.5 px-2.5 shrink-0 cursor-pointer select-none min-w-[106px]"
            )}
          >
            <span className="text-base leading-none">
              {getFlag(selectedCountry.iso)}
            </span>
            <span className="text-sm text-gray-700 font-medium tabular-nums whitespace-nowrap">
              {selectedCountry.code}
            </span>
            <ChevronDown className="h-3 w-3 text-gray-400 ml-auto shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-72 p-0 border border-gray-200 shadow-md rounded-lg bg-white"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code…"
              className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
            />
          </div>
          <div className="h-64 overflow-y-auto">
            <div className="p-1">
              {filtered.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  No results
                </p>
              )}
              {filtered.map((country) => {
                const isSelected =
                  country.code === parsed.countryCode &&
                  country.iso === selectedCountry.iso;
                return (
                  <button
                    key={country.iso}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-sm rounded-md hover:bg-gray-50 transition-colors duration-100 text-left"
                  >
                    <span className="text-base leading-none w-6 text-center">
                      {getFlag(country.iso)}
                    </span>
                    <span className="flex-1 text-gray-700 truncate">
                      {country.name}
                    </span>
                    <span className="text-gray-400 tabular-nums text-xs shrink-0">
                      {country.code}
                    </span>
                    <span className="w-3.5 shrink-0 flex items-center justify-center">
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-gray-500" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Input
        type="tel"
        value={parsed.localNumber}
        onChange={handleLocalNumberChange}
        placeholder={placeholder}
        className={cn(FORM_INPUT_CLASS, "flex-1")}
      />
    </div>
  );
}
