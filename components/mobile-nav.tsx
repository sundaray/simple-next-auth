"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, MotionConfig, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { navbarLinks } from "@/config/navbar"; // Importing the navigation links

// ============================================================================
// Main Exported Component: MobileNav
// This is the only component exported from this file. It is self-contained
// and manages its own state, orchestrating the icon, backdrop, and drawer.
// ============================================================================

interface MobileNavProps {
  menuIconSize?: number;
  iconLineColor?: string;
  iconLineHeight?: number;
  iconLineRounded?: boolean;
}

export function MobileNav({
  menuIconSize = 25,
  iconLineColor = "bg-gray-600",
  iconLineHeight = 1.5,
  iconLineRounded = true,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // Effect to handle closing the menu with the 'Escape' key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <MenuIcon
        isOpen={isOpen}
        onToggle={toggleMenu}
        size={menuIconSize}
        lineColor={iconLineColor}
        lineHeight={iconLineHeight}
        lineRounded={iconLineRounded}
      />
      <AnimatePresence>
        {isOpen && (
          <>
            <Backdrop onToggle={toggleMenu} />
            <MenuDrawer onLinkClick={() => setIsOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Internal Component: MenuIcon
// ============================================================================

interface MenuIconProps {
  isOpen: boolean;
  onToggle: () => void;
  size: number;
  lineColor: string;
  lineHeight: number;
  lineRounded: boolean;
}

function MenuIcon({
  isOpen,
  onToggle,
  size,
  lineColor,
  lineHeight,
  lineRounded,
}: MenuIconProps) {
  const duration = 0.3;
  const lineWidth = size * 0.7;
  const lineSpacing = size * 0.2;

  const topVariants = {
    closed: { y: -lineSpacing, rotate: 0 },
    open: { y: [-lineSpacing, 0, 0], rotate: [0, 0, 45] },
  };
  const centerVariants = {
    closed: { opacity: 1, transition: { duration: duration * 0.5 } },
    open: { opacity: [1, 1, 0] },
  };
  const bottomVariants = {
    closed: { y: lineSpacing, rotate: 0 },
    open: { y: [lineSpacing, 0, 0], rotate: [0, 0, -45] },
  };

  return (
    <MotionConfig
      transition={{ duration, ease: "easeOut", times: [0, 0.5, 1] }}
    >
      <motion.button
        onClick={onToggle}
        className="relative flex items-center justify-center z-50"
        style={{ width: size, height: size }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
      >
        <motion.div
          className={cn(
            "absolute origin-center",
            {
              "rounded-full": lineRounded,
            },
            lineColor
          )}
          style={{
            width: lineWidth,
            height: lineHeight,
            backgroundColor: lineColor,
          }}
          variants={topVariants}
        />
        <motion.div
          className={cn(
            "absolute origin-center",
            {
              "rounded-full": lineRounded,
            },
            lineColor
          )}
          style={{
            width: lineWidth,
            height: lineHeight,
            backgroundColor: lineColor,
          }}
          variants={centerVariants}
        />
        <motion.div
          className={cn(
            "absolute origin-center",
            {
              "rounded-full": lineRounded,
            },
            lineColor
          )}
          style={{
            width: lineWidth,
            height: lineHeight,
            backgroundColor: lineColor,
          }}
          variants={bottomVariants}
        />
      </motion.button>
    </MotionConfig>
  );
}

// ============================================================================
// Internal Component: Backdrop
// ============================================================================

interface BackdropProps {
  onToggle: () => void;
}

function Backdrop({ onToggle }: BackdropProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onToggle}
      className="fixed inset-x-0 top-20 bottom-0 z-30 bg-gray-950/20 backdrop-blur-xs"
      aria-hidden="true"
    />
  );
}

// ============================================================================
// Internal Component: MenuDrawer
// ============================================================================

interface MenuDrawerProps {
  onLinkClick: () => void;
}

function MenuDrawer({ onLinkClick }: MenuDrawerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute inset-x-4 top-24 z-40 origin-top rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5 h-fit"
    >
      <nav>
        <ul className="flex flex-col space-y-2">
          {navbarLinks.main.map((item) => (
            <li key={item.href}>
              <MobileNavLink href={item.href} onClick={onLinkClick}>
                {item.title}
              </MobileNavLink>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
}

// ============================================================================
// Internal Component: MobileNavLink
// ============================================================================

interface MobileNavLinkProps {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}

function MobileNavLink({ href, onClick, children }: MobileNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block rounded-md px-4 py-2 text-base font-medium transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
        isActive
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {children}
    </Link>
  );
}
