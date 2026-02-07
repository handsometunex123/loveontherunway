"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CartCountBadge from "./CartCountBadge";
import UserNav from "./UserNav";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Designers", href: "/designers" },
  { label: "Cart", href: "/cart" },
  { label: "Vote", href: "/vote" }
];

interface HeaderNavProps {
  displayName?: string;
}

export default function HeaderNav({ displayName }: HeaderNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="flex items-center gap-3 md:gap-0 md:ml-12">
      {/* Desktop Navigation */}
      <ul className="hidden md:flex list-none gap-3 p-0 m-0 items-center">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative inline-flex items-center rounded-full border px-3 py-2 text-sm font-bold transition-all ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-transparent text-slate-900 hover:border-slate-200 hover:bg-white"
                }`}
              >
                {item.label}
                {item.href === "/cart" ? <CartCountBadge /> : null}
              </Link>
            </li>
          );
        })}
        <UserNav displayName={displayName} />
      </ul>

      {/* Mobile Navigation Toggle */}
      <div className="md:hidden flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center rounded-lg border border-transparent p-2 text-slate-900 hover:bg-white hover:border-slate-200 transition-all"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg md:hidden mx-4 z-50">
          <div className="flex flex-col gap-2 p-4">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                  {item.href === "/cart" ? <CartCountBadge /> : null}
                </Link>
              );
            })}
            <UserNav displayName={displayName} variant="mobile" onNavigate={closeMobileMenu} />
          </div>
        </div>
      )}
    </nav>
  );
}
