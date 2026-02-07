"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  superAdminOnly?: boolean;
  designerOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Products", href: "/admin/products", designerOnly: true },
  { label: "Orders", href: "/admin/orders" },
  { label: "Profile", href: "/admin/profile", designerOnly: true },
  { label: "Designers", href: "/admin/designers", superAdminOnly: true },
  { label: "Settings", href: "/admin/settings", superAdminOnly: true }
];

export default function AdminNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="rounded-2xl border border-slate-200 bg-white overflow-x-auto">
      <ul className="flex gap-0 min-w-min">
        {NAV_ITEMS.filter((item) => {
          if (item.superAdminOnly) return isSuperAdmin;
          if (item.designerOnly) return !isSuperAdmin;
          return true;
        }).map((item, index) => {
          const active = isActive(item.href);
          const isLast = index === NAV_ITEMS.filter((i) => {
            if (i.superAdminOnly) return isSuperAdmin;
            if (i.designerOnly) return !isSuperAdmin;
            return true;
          }).length - 1;
          return (
            <li key={item.href} className={isLast ? "" : "border-r border-slate-200"}>
              <Link
                href={item.href}
                className={`inline-flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-semibold transition-all whitespace-nowrap ${
                  active
                    ? "bg-purple-50 text-purple-700 border-b-2 border-purple-600"
                    : "text-slate-600 hover:text-purple-700 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
