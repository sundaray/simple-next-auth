"use client";
// src/components/MenuIcon.tsx
import React, { useState } from "react";
import { motion, MotionConfig } from "motion/react";
import { cn } from "@/lib/utils";

type MenuIconSize = "sm" | "md" | "lg" | "xl" | number;

interface MenuIconProps {
  size?: MenuIconSize;
  color?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  className?: string;
  lineClassName?: string;
  duration?: number;
  ease?: string;
}

const presetSizes = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
} as const;

export default function MenuIcon({
  size = "md",
  color = "bg-gray-600",
  isOpen: controlledIsOpen,
  onToggle,
  className,
  lineClassName,
  duration = 0.3,
  ease = "easeOut",
}: MenuIconProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  // Calculate dimensions based on size
  const buttonSize = typeof size === "number" ? size : presetSizes[size];
  const lineWidth = buttonSize * 0.7;
  const lineHeight = buttonSize * 0.05;
  const lineSpacing = buttonSize * 0.2;

  const topVariants = {
    closed: { y: -lineSpacing, rotate: 0 },
    open: { y: [-lineSpacing, 0, 0], rotate: [0, 0, 45] },
  };

  const centerVariants = {
    closed: { opacity: [0, 0, 1] },
    open: { opacity: [1, 1, 0] },
  };

  const bottomVariants = {
    closed: { y: lineSpacing, rotate: 0 },
    open: { y: [lineSpacing, 0, 0], rotate: [0, 0, -45] },
  };

  function handleClick() {
    const newState = !isOpen;
    if (!isControlled) {
      setUncontrolledIsOpen(newState);
    }
    onToggle?.(newState);
  }

  return (
    <MotionConfig
      transition={{
        duration,
        ease,
        times: [0, 0.5, 1],
      }}
    >
      <button
        onClick={handleClick}
        className={cn(
          "relative border border-blue-200 flex items-center justify-center",
          className
        )}
        style={{
          width: buttonSize,
          height: buttonSize,
        }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <motion.div
          className={cn(
            "absolute origin-center rounded-full",
            color,
            lineClassName
          )}
          style={{
            width: lineWidth,
            height: lineHeight,
          }}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={topVariants}
        />

        <motion.div
          className={cn(
            "absolute origin-center rounded-full",
            color,
            lineClassName
          )}
          style={{
            width: lineWidth,
            height: lineHeight,
          }}
          initial={false}
          animate={isOpen ? "open" : "closed"}
          variants={centerVariants}
        />

        <motion.div
          className={cn(
            "absolute origin-center rounded-full",
            color,
            lineClassName
          )}
          style={{
            width: lineWidth,
            height: lineHeight,
          }}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={bottomVariants}
        />
      </button>
    </MotionConfig>
  );
}
