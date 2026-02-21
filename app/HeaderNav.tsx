"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CartCountBadge from "./CartCountBadge";
import UserNav from "./UserNav";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Designers", href: "/designers" },
  { label: "Cart", href: "/cart" },
  // { label: "Vote", href: "/vote" }
];

interface HeaderNavProps {
  displayName?: string;
  brandLogo?: string;
}

export default function HeaderNav({ displayName, brandLogo }: HeaderNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="flex items-center gap-3 md:gap-0 md:ml-12">
      {/* Desktop Navigation */}
      <ul className="hidden md:flex list-none gap-1 p-2 m-0 items-center rounded-2xl bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-md border border-white/40 shadow-lg">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative inline-flex items-center gap-2.5 rounded-xl px-5 py-3 text-base lg:text-lg font-bold transition-all duration-300 ${
                  active
                    ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg scale-105"
                    : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                {item.href === "/cart" && (
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.16.12-.33.12-.5 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                )}
                <span>{item.label}</span>
                {item.href === "/cart" ? <CartCountBadge /> : null}
              </Link>
            </li>
          );
        })}
        <div className="h-8 w-px bg-slate-200 mx-1"></div>
        <UserNav displayName={displayName} brandLogo={brandLogo} />
      </ul>

      {/* Mobile Navigation Toggle */}
      <div className="md:hidden flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center rounded-xl bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-md p-2.5 text-slate-900 hover:bg-white transition-all duration-300 shadow-md border border-white/40"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="absolute top-full left-0 right-0 mt-3 bg-gradient-to-br from-white/98 to-white/95 backdrop-blur-md rounded-2xl md:hidden mx-4 z-50 shadow-2xl border border-white/40">
          <div className="flex flex-col gap-2 p-4">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-base font-semibold transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg"
                      : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.href === "/cart" && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.16.12-.33.12-.5 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    )}
                    {item.label}
                  </div>
                  {item.href === "/cart" ? <CartCountBadge /> : null}
                </Link>
              );
            })}
            <div className="h-px bg-slate-200 my-2"></div>
            <UserNav displayName={displayName} brandLogo={brandLogo} variant="mobile" onNavigate={closeMobileMenu} />
          </div>
        </div>
      )}
    </nav>
  );
}
