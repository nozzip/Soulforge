import React from "react";
import { Box, Typography, Divider, alpha, useTheme } from "@mui/material";
import { GuideStep } from "../../../types";

interface GuideTimelineItemProps {
    step: GuideStep;
    index: number;
}

export const GuideTimelineItem: React.FC<GuideTimelineItemProps> = ({ step, index }) => {
    const theme = useTheme();

    return (
        <Box id={`step-${index}`} sx={{ position: "relative" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily: '"Cinzel", serif',
                        color: "secondary.main",
                        mr: 2,
                        opacity: 0.6,
                        fontWeight: 700,
                        fontSize: "0.9rem",
                    }}
                >
                    0{index + 1}
                </Typography>
                <Divider
                    sx={{
                        flexGrow: 1,
                        borderColor: alpha(theme.palette.secondary.main, 0.1),
                    }}
                />
            </Box>

            <Typography
                variant="h4"
                sx={{
                    fontFamily: '"Cinzel", serif',
                    fontSize: "1.6rem",
                    color: "common.white",
                    fontWeight: 700,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                {React.cloneElement(step.icon as React.ReactElement, {
                    sx: { color: "secondary.main", fontSize: 24 },
                } as any)}
                {step.title}
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    fontFamily: '"Newsreader", serif',
                    fontSize: "1.1rem",
                    color: "text.secondary",
                    lineHeight: 1.5,
                    fontStyle: "italic",
                    mb: 2,
                    pl: 2,
                    borderLeft: "2px solid",
                    borderColor: alpha(theme.palette.secondary.main, 0.2),
                }}
            >
                {step.description}
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    fontFamily: '"Newsreader", serif',
                    fontSize: "1.05rem",
                    color: "text.primary",
                    lineHeight: 1.6,
                    textAlign: "justify",
                    mb: 2,
                }}
            >
                {step.longDescription}
            </Typography>

            {step.tip && (
                <Box
                    sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.secondary.main, 0.03),
                        borderLeft: "3px solid",
                        borderColor: "secondary.main",
                        borderRadius: "0 4px 4px 0",
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: '"Newsreader", serif',
                            fontSize: "0.95rem",
                            color: "text.secondary",
                        }}
                    >
                        <strong>Sabiduría:</strong> {step.tip}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
