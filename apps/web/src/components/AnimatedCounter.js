import { jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { formatNumberIndian } from "../lib/format";
export function AnimatedCounter({ value, prefix = "", suffix = "", duration = 1200 }) {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef(null);
    useEffect(() => {
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(value * eased));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(step);
            }
        };
        rafRef.current = requestAnimationFrame(step);
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [value, duration]);
    return (_jsxs("span", { className: "metric-value", children: [prefix, formatNumberIndian(display), suffix] }));
}
