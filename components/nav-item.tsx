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
        // Base styles for the link
        "relative py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900",

        // Pseudo-element for the underline
        "after:content-[''] after:absolute after:bottom-1.5 after:left-0 after:h-[1.5px] after:w-0 after:bg-gray-900 after:transition-all after:duration-200 after:ease-out",

        // Hover state for the pseudo-element
        "hover:after:w-full",

        // Active state styles
        isActive && "text-gray-900 font-semibold"
      )}
      href={href}
    >
      {title}
    </Link>
  );
}
