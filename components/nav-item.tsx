"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavItemProps = {
  href: string;
  title: string;
};

export function NavItem({ href, title }: NavItemProps) {
  const pathname = usePathname();
  const isActive = href === pathname;

  return (
    <Link
      className={cn(
        "relative rounded-full px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 hover:text-gray-900",
        isActive && "bg-gray-100 text-gray-900",
      )}
      href={href}
    >
      {title}
    </Link>
  );
}
