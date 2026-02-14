import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number; // Delay in ms
    direction?: "up" | "left" | "right";
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    delay = 0,
    direction = "up",
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Animate once
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    const getTransform = () => {
        if (isVisible) return "none";
        switch (direction) {
            case "left":
                return "translateX(-48px)";
            case "right":
                return "translateX(48px)";
            case "up":
            default:
                return "translateY(48px)";
        }
    };

    return (
        <Box
            ref={ref}
            sx={{
                transition: "all 1s ease-out",
                opacity: isVisible ? 1 : 0,
                transform: getTransform(),
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </Box>
    );
};

export default ScrollReveal;
