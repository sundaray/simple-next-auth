"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Popover,
  PopoverButton,
  PopoverBackdrop,
  PopoverPanel,
} from "@headlessui/react";
import clsx from "clsx";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { UserAccountNavClient } from "@/components/user-account-nav-client";
import { Icons } from "@/components/icons";

/* ——— single link ——— */
function MobileNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <PopoverButton
      as={Link}
      href={href}
      className={cn(
        "flex w-fit items-center rounded-full px-4 py-2 font-medium text-gray-700 transition-colors",
        "hover:text-gray-900",
        isActive && "bg-gray-100 text-gray-900",
      )}
    >
      {children}
    </PopoverButton>
  );
}

/* ——— icon ——— */
function MobileNavIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 overflow-visible stroke-gray-700"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path
        d="M0 1H14M0 7H14M0 13H14"
        className={clsx(
          "origin-center transition",
          open && "scale-90 opacity-0",
        )}
      />
      <path
        d="M2 2L12 12M12 2L2 12"
        className={clsx(
          "origin-center transition",
          !open && "scale-90 opacity-0",
        )}
      />
    </svg>
  );
}

/* ——— the menu ——— */
export function MobileNav() {
  /* fetch the user session */
  const { user, loading } = useSession();

  /* figure out whether to show “Go Premium” */
  const needsPremium =
    !!user && !user.annualAccessStatus && !user.lifetimeAccessStatus;

  return (
    <Popover className="ml-auto md:hidden">
      {/* hamburger */}
      <PopoverButton
        className="relative z-10 flex size-8 items-center justify-center focus:not-data-focus:outline-hidden"
        aria-label="Toggle Navigation"
      >
        {({ open }) => <MobileNavIcon open={open} />}
      </PopoverButton>

      {/* backdrop */}
      <PopoverBackdrop
        transition
        className="fixed inset-0 bg-gray-950/30 duration-150 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in"
      />

      {/* panel */}
      <PopoverPanel
        transition
        className="text-md absolute inset-x-0 top-16 mx-4 flex origin-top flex-col gap-3 rounded-xl bg-white p-4 tracking-tight text-gray-900 shadow-xl ring-1 ring-gray-900/5 data-closed:scale-95 data-closed:opacity-0 data-enter:duration-150 data-enter:ease-out data-leave:duration-100 data-leave:ease-in"
      >
        <MobileNavLink href="/about">About</MobileNavLink>
        <MobileNavLink href="/podcasts">Podcasts</MobileNavLink>
        <MobileNavLink href="/tags">Tags</MobileNavLink>
        <MobileNavLink href="/blog">Blog</MobileNavLink>
        <hr className="border-gray-200" />

        {/* ---- auth / pricing area ---- */}
        {loading && (
          <div className="flex w-full items-center justify-center py-2">
            <Icons.loader className="size-4 animate-spin text-gray-500" />
          </div>
        )}

        {!loading && !user && (
          <>
            <PopoverButton
              as={Link}
              href="/premium"
              className="inline-flex w-full items-center justify-center rounded-full bg-linear-to-b from-amber-400 to-amber-500 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-amber-400 hover:text-gray-900"
            >
              Go Premium
            </PopoverButton>
            <PopoverButton
              as={Link}
              href="/signin"
              className="inline-flex w-full items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900/90 hover:text-white"
            >
              Sign in
            </PopoverButton>
          </>
        )}

        {!loading && user && (
          <>
            {needsPremium && (
              <PopoverButton
                as={Link}
                href="/premium"
                className="inline-flex w-full items-center justify-center rounded-full bg-linear-to-b from-amber-400 to-amber-500 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-amber-400 hover:text-gray-900"
              >
                Go Premium
              </PopoverButton>
            )}
            <UserAccountNavClient user={user} />
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
}
