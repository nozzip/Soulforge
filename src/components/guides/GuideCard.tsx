import React from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import { GuideStep } from "../../../types";

interface GuideCardProps {
    step: GuideStep;
}

export const GuideCard: React.FC<GuideCardProps> = ({ step }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                height: "100%",
                p: 3,
                position: "relative",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bgcolor: alpha(theme.palette.background.paper, 0.02),
                    zIndex: -1,
                },
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    fontFamily: '"Cinzel", serif',
                    color: "secondary.main",
                    fontWeight: 700,
                    fontSize: "1.4rem",
                    mb: 1,
                    borderBottom: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                    pb: 0.5,
                    display: "inline-block",
                    width: "100%",
                }}
            >
                {step.title}
            </Typography>

            <Typography
                variant="subtitle2"
                sx={{
                    fontFamily: '"Newsreader", serif',
                    color: "text.primary",
                    fontStyle: "italic",
                    mb: 2,
                    fontWeight: 600,
                    fontSize: "1rem",
                }}
            >
                {step.description}
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    fontFamily: '"Newsreader", serif',
                    fontSize: "1.05rem",
                    color: "text.secondary",
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
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        borderRadius: 1,
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                        mt: 2,
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: '"Newsreader", serif',
                            fontSize: "0.9rem",
                            color: "text.primary",
                            fontWeight: 500,
                        }}
                    >
                        <strong>Sabiduría del DM:</strong> {step.tip}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
