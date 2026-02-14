import React from "react";
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    List,
    ListItem,
    FormControlLabel,
    Checkbox,
    Chip,
    Button,
    Stack,
    alpha,
    ListItemText,
    ListItemIcon,
    useTheme,
} from "@mui/material";
import {
    Search,
    Close,
    Public,
    Straighten,
    SentimentDissatisfied,
} from "@mui/icons-material";

interface CatalogFiltersProps {
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    categories: string[];
    sizes: string[];
    designers: string[];
    creatureTypes: string[];
    weapons: string[];
    selectedCategories: string[];
    selectedSizes: string[];
    selectedDesigners: string[];
    selectedCreatureTypes: string[];
    selectedWeapons: string[];
    onToggleFilter: (
        type: "category" | "size" | "designer" | "creature_type" | "weapon",
        value: string
    ) => void;
    onReset: () => void;
    isMobile?: boolean;
    onCloseMobile?: () => void;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
    searchQuery,
    onSearchChange,
    categories,
    sizes,
    designers,
    creatureTypes,
    weapons,
    selectedCategories,
    selectedSizes,
    selectedDesigners,
    selectedCreatureTypes,
    selectedWeapons,
    onToggleFilter,
    onReset,
    isMobile,
    onCloseMobile,
}) => {
    const theme = useTheme();

    const sortedOptions = (options: string[]) =>
        [...options].sort((a, b) => a.localeCompare(b));

    const FILTER_GROUPS = [
        {
            id: "category",
            title: "Origen del Mundo",
            icon: <Public fontSize="small" />,
            options: sortedOptions(categories),
        },
        {
            id: "size",
            title: "Tamaño",
            icon: <Straighten fontSize="small" />,
            options: sortedOptions(sizes),
        },
        {
            id: "designer",
            title: "Gran Maestro (Diseñador)",
            icon: <Search fontSize="small" />,
            options: sortedOptions(designers),
        },
        {
            id: "creature_type",
            title: "Naturaleza de Criatura",
            icon: <SentimentDissatisfied fontSize="small" />,
            options: sortedOptions(creatureTypes),
        },
        {
            id: "weapon",
            title: "Arsenales (Armas)",
            icon: <Search fontSize="small" />,
            options: sortedOptions(weapons),
        },
    ];

    return (
        <Box
            sx={{
                p: 3,
                height: "100%",
                overflowY: "auto",
                background: (theme) =>
                    `linear-gradient(to bottom, ${alpha(
                        theme.palette.background.paper,
                        0.9
                    )}, ${theme.palette.background.default})`,
            }}
        >
            {isMobile && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="h6" color="secondary.main">
                        Filtros
                    </Typography>
                    <IconButton onClick={onCloseMobile}>
                        <Close />
                    </IconButton>
                </Box>
            )}

            <Box sx={{ position: "relative", mb: 4 }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        color: "secondary.main",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        mb: 1,
                        pb: 1,
                        borderBottom: 1,
                        borderColor: (theme) => alpha(theme.palette.secondary.main, 0.2),
                    }}
                >
                    Búsqueda en el Índice
                </Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar en los archivos..."
                    value={searchQuery}
                    onChange={onSearchChange}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="secondary" />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Box>

            <Stack spacing={4}>
                {FILTER_GROUPS.map((group) => (
                    <Box key={group.id}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: "grey.300",
                                mb: 1,
                                textTransform: "uppercase",
                                letterSpacing: 1,
                            }}
                        >
                            <Box component="span" sx={{ color: "primary.main" }}>
                                {group.icon}
                            </Box>{" "}
                            {group.title}
                        </Typography>
                        <List
                            dense
                            disablePadding
                            sx={{
                                borderLeft: 1,
                                borderColor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                                pl: 1,
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 0.5,
                            }}
                        >
                            {group.options.map((opt) => {
                                let isSelected = false;
                                if (group.id === "category")
                                    isSelected = selectedCategories.includes(opt);
                                else if (group.id === "size")
                                    isSelected = selectedSizes.includes(opt);
                                else if (group.id === "designer")
                                    isSelected = selectedDesigners.includes(opt);
                                else if (group.id === "creature_type")
                                    isSelected = selectedCreatureTypes.includes(opt);
                                else if (group.id === "weapon")
                                    isSelected = selectedWeapons.includes(opt);

                                return (
                                    <ListItem
                                        key={opt}
                                        component="div"
                                        disablePadding
                                        onClick={() =>
                                            onToggleFilter(
                                                group.id as
                                                | "category"
                                                | "size"
                                                | "designer"
                                                | "creature_type"
                                                | "weapon",
                                                opt
                                            )
                                        }
                                        sx={{
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: "transparent" },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            <Checkbox
                                                edge="start"
                                                checked={isSelected}
                                                tabIndex={-1}
                                                disableRipple
                                                sx={{
                                                    p: 0.5,
                                                    color: "grey.700",
                                                    "&.Mui-checked": { color: "primary.main" },
                                                }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={opt}
                                            primaryTypographyProps={{
                                                variant: "body2",
                                                color: isSelected ? "common.white" : "grey.500",
                                                fontWeight: isSelected ? "bold" : "normal",
                                            }}
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                ))}
            </Stack>

            {/* Active Filters Section */}
            {(selectedCategories.length > 0 ||
                selectedSizes.length > 0 ||
                selectedDesigners.length > 0 ||
                selectedCreatureTypes.length > 0 ||
                selectedWeapons.length > 0) && (
                    <Box sx={{ mt: 4, mb: 2 }}>
                        <Typography
                            variant="caption"
                            color="grey.500"
                            sx={{
                                mb: 1,
                                display: "block",
                                textTransform: "uppercase",
                                letterSpacing: 1,
                            }}
                        >
                            Filtros Activos
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {selectedCategories.map((cat) => (
                                <Chip
                                    key={`cat-${cat}`}
                                    label={cat}
                                    onDelete={() => onToggleFilter("category", cat)}
                                    size="small"
                                    color="primary"
                                />
                            ))}
                            {selectedSizes.map((size) => (
                                <Chip
                                    key={`size-${size}`}
                                    label={size}
                                    onDelete={() => onToggleFilter("size", size)}
                                    size="small"
                                    color="primary"
                                />
                            ))}
                            {selectedDesigners.map((designer) => (
                                <Chip
                                    key={`des-${designer}`}
                                    label={designer}
                                    onDelete={() => onToggleFilter("designer", designer)}
                                    size="small"
                                    color="primary"
                                />
                            ))}
                            {selectedCreatureTypes.map((type) => (
                                <Chip
                                    key={`type-${type}`}
                                    label={type}
                                    onDelete={() => onToggleFilter("creature_type", type)}
                                    size="small"
                                    color="primary"
                                />
                            ))}
                            {selectedWeapons.map((weapon) => (
                                <Chip
                                    key={`weap-${weapon}`}
                                    label={weapon}
                                    onDelete={() => onToggleFilter("weapon", weapon)}
                                    size="small"
                                    color="primary"
                                />
                            ))}

                            <Chip
                                label="Limpiar todo"
                                onClick={onReset}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                sx={{ borderColor: "secondary.main", color: "secondary.main" }}
                            />
                        </Box>
                    </Box>
                )}

            <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={onReset}
                sx={{ mt: 2, letterSpacing: 2 }}
            >
                Reiniciar Índice
            </Button>
        </Box>
    );
};
