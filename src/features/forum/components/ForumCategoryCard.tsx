import React from "react";
import {
    Card,
    CardActionArea,
    Box,
    Typography,
    alpha,
    useTheme,
    SvgIconTypeMap,
} from "@mui/material";
import {
    LocalBar as LocalBarIcon,
    AutoStories as AutoStoriesIcon,
    Forum as ForumIcon,
    Groups as GroupsIcon,
    Handyman as HandymanIcon,
    ReportProblem as HorrorIcon,
    School as SchoolIcon,
    Security as DmIcon,
    Pets as BeastIcon,
    HelpOutline as QuestionIcon,
} from "@mui/icons-material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { ForumCategory } from "@/types";

// Map icons based on category name
const getIcon = (name: string): OverridableComponent<SvgIconTypeMap<{}, "svg">> => {
    const n = name.toLowerCase();
    if (n.includes("taberna")) return LocalBarIcon;
    if (n.includes("buscador")) return GroupsIcon;
    if (n.includes("forja")) return HandymanIcon;
    if (n.includes("historias")) return HorrorIcon;
    if (n.includes("reglas")) return SchoolIcon;
    if (n.includes("lore") || n.includes("mundo")) return AutoStoriesIcon;
    if (n.includes("master") || n.includes("dm")) return DmIcon;
    if (n.includes("bestiario") || n.includes("monstruo")) return BeastIcon;
    if (n.includes("ayuda") || n.includes("feedback")) return QuestionIcon;
    return ForumIcon;
};

interface ForumCategoryCardProps {
    category: ForumCategory;
    stats?: { threads: number; posts: number };
    onCategorySelect: (categoryId: string) => void;
    onLFGClick?: () => void;
}

export const ForumCategoryCard: React.FC<ForumCategoryCardProps> = ({
    category,
    stats,
    onCategorySelect,
    onLFGClick,
}) => {
    const theme = useTheme();
    const Icon = getIcon(category.name);

    const handleClick = () => {
        // If Buscador de Aventureros is clicked, route to LFG Board if prop provided
        if (category.name.toLowerCase().includes("buscador") && onLFGClick) {
            onLFGClick();
        } else {
            onCategorySelect(category.id);
        }
    };

    return (
        <Card
            sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.2),
                border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
                transition: "all 0.3s",
                "&:hover": {
                    bgcolor: alpha(theme.palette.background.paper, 0.4),
                    transform: "translateX(4px)",
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.4)}`,
                },
            }}
        >
            <CardActionArea onClick={handleClick} sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Box
                        sx={{
                            p: 1.5,
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            borderRadius: 2,
                            display: "flex",
                            color: "secondary.main",
                        }}
                    >
                        <Icon fontSize="large" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "Cinzel, serif",
                                fontWeight: 700,
                                color: "text.primary",
                                mb: 0.5,
                            }}
                        >
                            {category.name}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontFamily: '"Newsreader", serif',
                            }}
                        >
                            {category.description}
                        </Typography>
                    </Box>
                    {/* Stats */}
                    <Box
                        sx={{
                            display: { xs: "none", sm: "flex" },
                            gap: 3,
                            mr: 2,
                        }}
                    >
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                PERGAMINOS
                            </Typography>
                            <Typography
                                variant="body2"
                                color="secondary.main"
                                fontWeight="bold"
                            >
                                {stats?.threads || 0}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                RUNAS
                            </Typography>
                            <Typography
                                variant="body2"
                                color="secondary.main"
                                fontWeight="bold"
                            >
                                {stats?.posts || 0}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardActionArea>
        </Card>
    );
};
