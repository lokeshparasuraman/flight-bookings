/**
 * Tooltip.tsx — Portal-based Tooltip
 *
 * Why a portal? CSS ::after pseudo-element tooltips get clipped by parent
 * containers that have `overflow: hidden` or create a stacking context.
 * On the home page tab grid, the grid container clips them so the tooltip
 * label appears under adjacent nav buttons on small/mobile screens.
 *
 * This component renders the tooltip bubble directly under <body> via
 * ReactDOM.createPortal, using position: fixed so it is completely
 * independent of any parent stacking context or overflow.
 *
 * Usage:
 *   <Tooltip label="Search Flights" direction="above" | "below">
 *     <button>...</button>
 *   </Tooltip>
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  /** The tooltip label text */
  label: string;
  /** Direction the bubble appears relative to the trigger element */
  direction?: "above" | "below";
  children: React.ReactElement;
  /** Disable the tooltip entirely (e.g. on touch devices where hover isn't natural) */
  disabled?: boolean;
}

interface TooltipPos {
  top: number;
  left: number;
  transformOrigin: string;
}

export default function Tooltip({
  label,
  direction = "below",
  children,
  disabled = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<TooltipPos>({ top: 0, left: 0, transformOrigin: "top center" });
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const GAP = 8; // px gap between trigger and tooltip bubble

  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    if (direction === "above") {
      setPos({
        top: rect.top - GAP,
        left: centerX,
        transformOrigin: "bottom center",
      });
    } else {
      setPos({
        top: rect.bottom + GAP,
        left: centerX,
        transformOrigin: "top center",
      });
    }
  }, [direction]);

  const show = useCallback(() => {
    if (disabled) return;
    computePosition();
    setVisible(true);
  }, [disabled, computePosition]);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  // Recompute position on scroll / resize while visible
  useEffect(() => {
    if (!visible) return;
    const update = () => computePosition();
    window.addEventListener("scroll", update, { passive: true, capture: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [visible, computePosition]);

  // Clone the single child and inject the trigger ref + hover handlers
  const child = React.cloneElement(children, {
    ref: (el: HTMLElement | null) => {
      triggerRef.current = el;
      // Forward any existing ref on the child
      const existingRef = (children as any).ref;
      if (typeof existingRef === "function") existingRef(el);
      else if (existingRef && typeof existingRef === "object") existingRef.current = el;
    },
    onMouseEnter: (e: React.MouseEvent) => {
      show();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      show();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hide();
      children.props.onBlur?.(e);
    },
  });

  const bubble = visible && label ? (
    <div
      ref={tooltipRef}
      role="tooltip"
      style={{
        position: "fixed",
        // The tooltip is always centered on the trigger's X midpoint.
        // We use left + translateX(-50%) so we don't need to know width upfront.
        top: direction === "above" ? pos.top : pos.top,
        left: pos.left,
        transform: `translateX(-50%) ${direction === "above" ? "translateY(-100%)" : "translateY(0%)"}`,
        // Sit above everything — header is z-50 (3200 in Tailwind scale).
        // We use 99999 to be safely above every stacking context.
        zIndex: 99999,
        pointerEvents: "none",
        // Animation
        animation: "tooltip-fade-in 0.13s cubic-bezier(0.16,1,0.3,1) forwards",
      }}
    >
      <span
        style={{
          display: "inline-block",
          background: "#18181b",
          color: "#ffffff",
          padding: "5px 10px",
          fontSize: "10px",
          fontWeight: 700,
          whiteSpace: "nowrap",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          borderRadius: 0,
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        {label}
      </span>
    </div>
  ) : null;

  return (
    <>
      {child}
      {bubble && createPortal(bubble, document.body)}
    </>
  );
}
