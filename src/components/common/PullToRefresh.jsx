import React, { useRef, useState, useEffect } from "react";

// Lightweight pull-to-refresh for mobile web. Non-intrusive and keeps existing layout.
// Usage: <PullToRefresh onRefresh={reload}>{children}</PullToRefresh>
export default function PullToRefresh({ onRefresh, children, threshold = 70 }) {
  const containerRef = useRef(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (window.scrollY === 0 && !refreshing) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
        setPullDistance(0);
      }
    };

    const onTouchMove = (e) => {
      if (!pulling.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        // ease the pull motion
        const eased = Math.min(threshold * 2, dy * 0.6);
        setPullDistance(eased);
        e.preventDefault();
      } else {
        pulling.current = false;
        setPullDistance(0);
      }
    };

    const endPull = () => {
      pulling.current = false;
      setPullDistance(0);
    };

    const onTouchEnd = async () => {
      if (!pulling.current) return;
      const shouldRefresh = pullDistance >= threshold;
      endPull();
      if (shouldRefresh && onRefresh) {
        setRefreshing(true);
        try {
          await Promise.resolve(onRefresh());
        } finally {
          setRefreshing(false);
        }
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, pullDistance, threshold, refreshing]);

  return (
    <div ref={containerRef} style={{ touchAction: "pan-x pan-y" }}>
      <div
        style={{
          height: pullDistance,
          transition: pulling.current ? "none" : "height 160ms ease-out",
        }}
        className="flex items-end justify-center text-xs text-gray-500 dark:text-gray-400 select-none"
      >
        <div className="mb-2">
          {refreshing ? (
            <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          ) : pullDistance > 0 ? (
            <div className="opacity-80">Pull to refresh</div>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}