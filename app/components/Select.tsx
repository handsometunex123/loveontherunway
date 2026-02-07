"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SelectOption = {
  label: string;
  value: string;
};

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select",
  disabled = false,
  className = "",
  buttonClassName = "",
  panelClassName = ""
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedLabel = useMemo(() => {
    return options.find((opt) => opt.value === value)?.label || "";
  }, [options, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        } ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selectedLabel ? "text-slate-900" : "text-slate-400"}>
          {selectedLabel || placeholder}
        </span>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          ▾
        </span>
      </button>

      {open && !disabled && (
        <div
          className={`absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-lg ${panelClassName}`}
          role="listbox"
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500">No options</div>
          ) : (
            options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                    active
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
