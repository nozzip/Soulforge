import React, { useState, useMemo, useRef } from "react";
import { ViewState, Product, Profile } from "../types";
import { useCart } from "../context/CartContext";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  useTheme,
  Container,
  ListItemIcon,
  Paper,
  ClickAwayListener,
  ListSubheader,
  Tooltip,
  Slide,
  useScrollTrigger,
  Avatar,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Construction as ConstructionIcon,
  Token as TokenIcon,
  Map as MapIcon,
  ArrowForward as ArrowForwardIcon,
  HelpOutline as HelpIcon,
} from "@mui/icons-material";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import { useProducts } from "@/src/hooks/useProducts";
import { useQueryClient } from "@tanstack/react-query";

// Custom Treasure Chest Icon
const TreasureChestIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path fill="currentColor" d="M3 11v8c0 .5.5 1 1 1h14c.5 0 1-.5 1-1v-8H3z" />
    <path
      fill="currentColor"
      d="M5 11V9c0-1.7 1.3-3 3-3h6c1.7 0 3 1.3 3 3v2l2-4c0-2.2-1.8-4-4-4H7C4.8 4 3 5.8 3 8l2 3z"
    />
    <ellipse
      fill="currentColor"
      cx="14"
      cy="5"
      rx="4"
      ry="2.5"
      transform="rotate(-20 14 5)"
    />
    <path
      fill="currentColor"
      d="M6 11c1 0 1.5-1 2.5-1s1.5 1 2.5 1 1.5-1 2.5-1 1.5 1 2.5 1v-1c-1 0-1.5-1-2.5-1s-1.5 1-2.5 1-1.5-1-2.5-1-1.5 1-2.5 1v1z"
      opacity="0.6"
    />
    <circle fill="currentColor" cx="10" cy="15" r="1.2" opacity="0.4" />
    <rect
      fill="currentColor"
      x="9.4"
      y="15.5"
      width="1.2"
      height="2"
      opacity="0.4"
    />
    <path fill="currentColor" d="M4 6l.8-2L4 2l-.8 2L1 4l2.2.8L4 6z" />
    <path
      fill="currentColor"
      d="M21 9l.6-1.5.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5L19 9.6l1.5-.6z"
    />
    <path fill="currentColor" d="M7 3l.4-1L7 1l-.4 1L5.5 2l1.1.4.4 1z" />
  </SvgIcon>
);

// Styled Components
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "50px",
  backgroundColor: alpha(theme.palette.common.white, 0.15), // Increased opacity for better visibility
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
    border: `1px solid ${alpha(theme.palette.secondary.main, 0.5)}`,
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: alpha(theme.palette.common.white, 0.8), // Increased visibility
  zIndex: 1,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.common.white,
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create(["width", "background-color"]),
    width: "100%",
    textTransform: "none",
    fontFamily: '"Newsreader", serif',
    fontSize: "0.95rem",
    letterSpacing: "0.03em",
    fontWeight: 500, // Slightly bolder text
    [theme.breakpoints.up("md")]: {
      width: "20ch",
      "&:focus": {
        width: "30ch",
      },
    },
    "&::placeholder": {
      color: alpha(theme.palette.common.white, 0.7), // Increased placeholder visibility
      fontStyle: "italic",
      opacity: 1, // Force opacity
    },
  },
}));

interface HideOnScrollProps {
  children: React.ReactElement;
}

function HideOnScroll({ children }: HideOnScrollProps) {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

interface NavbarProps {
  setView: (view: ViewState, options?: { resetScroll?: boolean }) => void;
  currentView: ViewState;
  onSearch: (query: string) => void;
  onProductSelect: (id: string) => void;
  user?: string | null;
  userProfile?: Profile | null;
  isAdmin?: boolean;
  onLogout?: () => void;
  isWarhammer: boolean;
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  setView,
  currentView,
  onSearch,
  onProductSelect,
  user,
  userProfile,
  isAdmin,
  onLogout,
  isWarhammer,
  onToggleTheme,
}) => {
  const theme = useTheme();
  const { data: products } = useProducts();
  const { totalItems } = useCart();
  const [searchInput, setSearchInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isCheckout = currentView === ViewState.CHECKOUT;

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (user) {
      setAnchorElUser(event.currentTarget);
    } else {
      setView(ViewState.LOGIN);
    }
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const searchSuggestions = useMemo(() => {
    if (!searchInput.trim()) return [];
    const lowerQuery = searchInput.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery),
      )
      .slice(0, 5);
  }, [searchInput, products]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        Math.min(prev + 1, searchSuggestions.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchSuggestions.length) {
        handleSuggestionClick(searchSuggestions[selectedIndex].id);
      } else {
        onSearch(searchInput);
        setIsFocused(false);
        (e.target as HTMLInputElement).blur();
      }
    }
  };

  const handleSearchClick = () => {
    onSearch(searchInput);
  };

  const handleSuggestionClick = (productId: string) => {
    onProductSelect(productId);
    setIsFocused(false);
    setSearchInput("");
    setSelectedIndex(-1);
  };

  // Reset selected index when search input changes
  React.useEffect(() => {
    setSelectedIndex(-1);
  }, [searchInput]);

  const drawerContent = (
    <Box
      onClick={handleDrawerToggle}
      sx={{
        textAlign: "center",
        height: "100%",
        overflowY: "auto",
        bgcolor: isWarhammer ? "#0b1120" : "#2c0b0e",
        backgroundImage: isWarhammer
          ? "linear-gradient(180deg, #0b1120 0%, #0c4a6e 100%)" // Blue/Black for Warhammer
          : "linear-gradient(180deg, #2c0b0e 0%, #5c1c1c 100%)", // Red/Black for Fantasy
        color: "white",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          my: 2,
          fontFamily: "Cinzel, serif",
          fontWeight: "bold",
          letterSpacing: 2,
          color: isWarhammer ? "#d32f2f" : "#2e7fc3",
          filter: `drop-shadow(0 0 5px ${isWarhammer ? "rgba(211, 47, 47, 0.5)" : "rgba(46, 127, 195, 0.5)"})`,
        }}
      >
        MENÚ
      </Typography>
      <Box sx={{ px: 2, mb: 2, position: "relative" }}>
        <Search onClick={(e) => e.stopPropagation()}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Buscar..."
            inputProps={{ "aria-label": "search" }}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch(searchInput);
                setMobileOpen(false);
              }
            }}
          />
        </Search>
      </Box>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={onToggleTheme}>
            <ListItemIcon sx={{ color: "secondary.main" }}>
              {isWarhammer ? <ConstructionIcon /> : <TokenIcon />}
            </ListItemIcon>
            <ListItemText
              primary={
                isWarhammer ? "Cambiar a Fantasía" : "Cambiar a Grimdark"
              }
              primaryTypographyProps={{
                fontFamily: '"Newsreader", serif',
                fontSize: "1.05rem",
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setView(ViewState.CATALOG)}>
            <ListItemText
              primary="CATÁLOGO"
              primaryTypographyProps={{
                fontFamily: '"Newsreader", serif',
                fontSize: "1.05rem",
                color:
                  currentView === ViewState.CATALOG
                    ? isWarhammer
                      ? "#d32f2f"
                      : "#2e7fc3"
                    : "inherit",
                fontWeight:
                  currentView === ViewState.CATALOG ? "bold" : "normal",
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setView(ViewState.HOW_TO_BUY)}>
            <ListItemIcon>
              <HelpIcon sx={{ color: "secondary.main" }} />
            </ListItemIcon>
            <ListItemText
              primary="CÓMO COMPRAR"
              primaryTypographyProps={{
                fontFamily: '"Newsreader", serif',
                fontSize: "1.05rem",
                color:
                  currentView === ViewState.HOW_TO_BUY
                    ? isWarhammer
                      ? "#d32f2f"
                      : "#2e7fc3"
                    : "inherit",
                fontWeight:
                  currentView === ViewState.HOW_TO_BUY ? "bold" : "normal",
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setView(ViewState.NEW_ADVENTURER)}>
            <ListItemIcon>
              <MapIcon sx={{ color: "secondary.main" }} />
            </ListItemIcon>
            <ListItemText
              primary="GUÍA DEL AVENTURERO"
              primaryTypographyProps={{
                fontFamily: '"Newsreader", serif',
                fontSize: "1.05rem",
                color:
                  currentView === ViewState.NEW_ADVENTURER
                    ? isWarhammer
                      ? "#d32f2f"
                      : "#2e7fc3"
                    : "inherit",
                fontWeight:
                  currentView === ViewState.NEW_ADVENTURER ? "bold" : "normal",
              }}
            />
          </ListItemButton>
        </ListItem>
        {isAdmin && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => setView(ViewState.ADMIN)}>
              <ListItemText
                primary="ADMIN"
                primaryTypographyProps={{
                  fontFamily: '"Newsreader", serif',
                }}
              />
            </ListItemButton>
          </ListItem>
        )}
        {user ? (
          <>
            <ListSubheader
              sx={{
                bgcolor: "transparent",
                color: "secondary.main",
                mt: 2,
                fontFamily: '"Newsreader", serif',
                fontSize: "0.9rem",
                fontStyle: "italic",
              }}
            >
              Sesión iniciada como {userProfile?.username || user}
            </ListSubheader>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setView(ViewState.PROFILE)}>
                <ListItemIcon>
                  {userProfile?.avatar_url ? (
                    <Avatar
                      src={userProfile.avatar_url}
                      sx={{ width: 24, height: 24, border: 1, borderColor: 'secondary.main' }}
                    />
                  ) : (
                    <PersonIcon sx={{ color: "secondary.main" }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Mi Perfil"
                  primaryTypographyProps={{
                    fontFamily: '"Newsreader", serif',
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setView(ViewState.WISHLIST)}>
                <ListItemIcon>
                  <FavoriteIcon sx={{ color: "secondary.main" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Lista de Deseos"
                  primaryTypographyProps={{
                    fontFamily: '"Newsreader", serif',
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setView(ViewState.ORDERS)}>
                <ListItemIcon>
                  <HistoryIcon sx={{ color: "secondary.main" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Pedidos"
                  primaryTypographyProps={{
                    fontFamily: '"Newsreader", serif',
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (onLogout) onLogout();
                }}
              >
                <ListItemIcon>
                  <LogoutIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary="Cerrar Sesión"
                  sx={{ color: "error.main" }}
                  primaryTypographyProps={{
                    fontFamily: '"Newsreader", serif',
                  }}
                />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setView(ViewState.LOGIN)}
              sx={{
                mt: 2,
                bgcolor: "secondary.main",
                color: "background.default",
                "&:hover": { bgcolor: "primary.main" },
              }}
            >
              <ListItemText
                primary="INICIAR SESIÓN / UNIRSE"
                sx={{ textAlign: "center", fontWeight: "bold" }}
                primaryTypographyProps={{
                  fontFamily: '"Newsreader", serif',
                }}
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <HideOnScroll>
        <AppBar
          position="fixed"
          sx={{
            bgcolor: "transparent", // Keep transparent background
            backdropFilter: "blur(4px)", // Maintain blur
            borderBottom: "none",
            boxShadow: "none",
            transition: "all 0.5s ease",
            zIndex: theme.zIndex.drawer + 1,
            mt: 0, // Removed top margin to allow full hiding
          }}
          elevation={0}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Toolbar
              disableGutters
              sx={{ height: 90, justifyContent: "space-between" }}
            >
              {/* LEFT: Logo / Home */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: { xs: "auto", sm: "250px" },
                }}
              >
                <Button
                  onClick={() => setView(ViewState.HOME, { resetScroll: true })}
                  sx={{
                    color: "secondary.main",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    transition: "transform 0.1s ease",
                    "&:active": { transform: "scale(0.95)" },
                    "&:hover": {
                      bgcolor: "transparent",
                      opacity: 0.9,
                    },
                  }}
                >
                  {isCheckout ? (
                    <TokenIcon
                      fontSize="large"
                      sx={{ filter: "drop-shadow(0 0 2px white)" }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src={
                        isWarhammer
                          ? `https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/guide/logoTextoSolo.svg`
                          : `https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/guide/logoTextoSolo_fantasy.svg`
                      }
                      alt="Soulforge"
                      sx={{
                        height: { xs: 32, sm: 64 },
                        width: "auto",
                        filter: isWarhammer
                          ? "drop-shadow(0 0 1px white) drop-shadow(0 0 2px rgba(255,255,255,0.5))"
                          : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                      }}
                    />
                  )}
                </Button>
              </Box>

              {/* CENTER: Search Bar */}
              {!isCheckout && (
                <Box
                  ref={searchContainerRef}
                  sx={{
                    display: { xs: "none", md: "flex" },
                    flexGrow: 1,
                    justifyContent: "center",
                    maxWidth: "600px",
                    mx: 4,
                  }}
                >
                  <ClickAwayListener onClickAway={() => setIsFocused(false)}>
                    <Box sx={{ width: "100%" }}>
                      <Search>
                        <SearchIconWrapper>
                          <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                          placeholder="Buscar en los archivos..."
                          inputProps={{ "aria-label": "search" }}
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          onFocus={() => setIsFocused(true)}
                          onKeyDown={handleKeyDown}
                          sx={{ width: "100%" }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            right: 4,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "secondary.main",
                          }}
                          onClick={handleSearchClick}
                        >
                          <ArrowForwardIcon fontSize="small" />
                        </IconButton>

                        {/* Search Preview Dropdown */}
                        {isFocused && searchInput.trim().length > 0 && (
                          <Paper
                            sx={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              mt: 1,
                              zIndex: 10,
                              bgcolor: "rgba(20, 20, 20, 0.95)",
                              backdropFilter: "blur(10px)",
                              border: 1,
                              borderColor: "rgba(255, 255, 255, 0.1)",
                              borderRadius: "16px",
                              overflow: "hidden",
                              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
                            }}
                          >
                            <List dense>
                              {searchSuggestions.length > 0 ? (
                                <>
                                  {searchSuggestions.map((product, index) => (
                                    <ListItem key={product.id} disablePadding>
                                      <ListItemButton
                                        selected={index === selectedIndex}
                                        onClick={() =>
                                          handleSuggestionClick(product.id)
                                        }
                                        sx={{
                                          bgcolor:
                                            index === selectedIndex
                                              ? "rgba(255, 255, 255, 0.15)"
                                              : "transparent",
                                          "&:hover": {
                                            bgcolor: "rgba(255, 255, 255, 0.1)",
                                          },
                                        }}
                                      >
                                        <Box
                                          component="img"
                                          src={product.image}
                                          sx={{
                                            width: 40,
                                            height: 40,
                                            mr: 2,
                                            objectFit: "cover",
                                            borderRadius: 1,
                                          }}
                                        />
                                        <ListItemText
                                          primary={product.name}
                                          primaryTypographyProps={{
                                            color: "text.primary",
                                            fontWeight: 500,
                                            fontFamily: '"Newsreader", serif',
                                          }}
                                          secondary={
                                            <Typography
                                              variant="caption"
                                              sx={{ color: "secondary.main" }}
                                            >
                                              {product.category} •{" "}
                                              {product.price} GP
                                            </Typography>
                                          }
                                        />
                                      </ListItemButton>
                                    </ListItem>
                                  ))}
                                  <ListItem disablePadding>
                                    <ListItemButton
                                      onClick={handleSearchClick}
                                      sx={{
                                        justifyContent: "center",
                                        py: 1.5,
                                        bgcolor: "rgba(255, 255, 255, 0.02)",
                                        "&:hover": {
                                          bgcolor: "rgba(255, 255, 255, 0.05)",
                                        },
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: "secondary.main",
                                          fontWeight: "bold",
                                          letterSpacing: 1,
                                        }}
                                      >
                                        VER TODOS LOS RESULTADOS
                                      </Typography>
                                    </ListItemButton>
                                  </ListItem>
                                </>
                              ) : (
                                <ListItem>
                                  <ListItemText
                                    secondary={`No se encontraron artefactos que coincidan con "${searchInput}"`}
                                    secondaryTypographyProps={{
                                      sx: {
                                        fontStyle: "italic",
                                        textAlign: "center",
                                        color: "text.secondary",
                                      },
                                    }}
                                  />
                                </ListItem>
                              )}
                            </List>
                          </Paper>
                        )}
                      </Search>
                    </Box>
                  </ClickAwayListener>
                </Box>
              )}

              {/* RIGHT: Navigation Links & Actions */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  width: "auto",
                  justifyContent: "flex-end",
                }}
              >
                {!isCheckout && (
                  <Box
                    sx={{
                      display: { xs: "none", lg: "flex" },
                      gap: 1,
                      mr: 2,
                      alignItems: "center",
                    }}
                  >
                    {[
                      {
                        label: "Catálogo",
                        view: ViewState.CATALOG,
                        icon: null,
                      },
                      {
                        label: "Cómo Comprar",
                        view: ViewState.HOW_TO_BUY,
                        icon: null,
                      },
                      {
                        label: "Guía",
                        view: ViewState.NEW_ADVENTURER,
                        icon: null,
                      },
                      {
                        label: "La Taberna",
                        view: ViewState.FORUM_HOME,
                        icon: null,
                      },
                      ...(isAdmin
                        ? [
                          {
                            label: "Admin",
                            view: ViewState.ADMIN,
                            icon: (
                              <ConstructionIcon
                                sx={{
                                  fontSize: 16,
                                  mb: 0.5,
                                  color: isWarhammer ? "inherit" : "#e65100",
                                }}
                              />
                            ),
                          },
                        ]
                        : []),
                    ].map((item) => (
                      <Button
                        key={item.label}
                        onClick={() =>
                          setView(item.view, { resetScroll: true })
                        }
                        startIcon={item.icon}
                        sx={{
                          color:
                            currentView === item.view
                              ? isWarhammer
                                ? "#0ea5e9"
                                : "#d41111"
                              : "white",
                          position: "relative",
                          fontFamily: '"Newsreader", serif',
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          textTransform: "none",
                          letterSpacing: "0.02em",
                          px: 1.5,
                          minWidth: "auto",
                          textShadow: "0 1px 3px rgba(0,0,0,0.8)",

                          transition: "all 0.1s ease",
                          "&:active": {
                            transform: "scale(0.95)",
                          },
                          "&:hover": {
                            color: isWarhammer ? "#38bdf8" : "#e8c978",
                            bgcolor: "transparent",
                            textShadow: isWarhammer
                              ? "0 0 8px rgba(14, 165, 233, 0.8)"
                              : "0 0 8px rgba(197, 160, 89, 0.8)",
                          },
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </Box>
                )}
                {!isCheckout && (
                  <>
                    <Tooltip
                      title={
                        isWarhammer
                          ? "Volver a Fantasía"
                          : "Activar Protocolo Grimdark"
                      }
                      arrow
                    >
                      <IconButton onClick={onToggleTheme} color="inherit">
                        {isWarhammer ? <ConstructionIcon /> : <TokenIcon />}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Tu Botín" arrow>
                      <IconButton
                        onClick={() => setView(ViewState.CART)}
                        color="inherit"
                      >
                        <Badge badgeContent={totalItems} color="primary">
                          <TreasureChestIcon />
                        </Badge>
                      </IconButton>
                    </Tooltip>

                    <Box
                      sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}
                    >
                      <Tooltip
                        title={user ? "Mi Cuenta" : "Iniciar Sesión"}
                        arrow
                      >
                        <IconButton
                          onClick={handleOpenUserMenu}
                          sx={{
                            p: 0, // Profile images look better without padding adjustment if they are avatars
                            ml: 1,
                            border: user ? 1 : 0,
                            borderColor: "secondary.main",
                            borderRadius: "50%",
                            overflow: "hidden"
                          }}
                        >
                          {userProfile?.avatar_url ? (
                            <Avatar
                              src={userProfile.avatar_url}
                              sx={{ width: 32, height: 32 }}
                            />
                          ) : (
                            <Box sx={{ p: 0.5, display: 'flex' }}>
                              <PersonIcon
                                sx={{ color: user ? "secondary.main" : "inherit" }}
                              />
                            </Box>
                          )}
                        </IconButton>
                      </Tooltip>
                      <Menu
                        sx={{ mt: "45px" }}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        keepMounted
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                      >
                        <Box
                          sx={{
                            px: 2,
                            py: 1,
                            borderBottom: 1,
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Sesión iniciada como
                          </Typography>
                          <Typography variant="subtitle2">{userProfile?.username || user}</Typography>
                        </Box>
                        <MenuItem
                          onClick={() => {
                            setView(ViewState.PROFILE);
                            handleCloseUserMenu();
                          }}
                        >
                          <ListItemIcon>
                            <PersonIcon fontSize="small" />
                          </ListItemIcon>
                          <Typography textAlign="center">Mi Perfil</Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setView(ViewState.WISHLIST);
                            handleCloseUserMenu();
                          }}
                        >
                          <ListItemIcon>
                            <FavoriteIcon fontSize="small" />
                          </ListItemIcon>
                          <Typography textAlign="center">
                            Mi Lista de Deseos
                          </Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setView(ViewState.ORDERS);
                            handleCloseUserMenu();
                          }}
                        >
                          <ListItemIcon>
                            <HistoryIcon fontSize="small" />
                          </ListItemIcon>
                          <Typography textAlign="center">
                            Mis Pedidos
                          </Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            if (onLogout) onLogout();
                            handleCloseUserMenu();
                          }}
                        >
                          <ListItemIcon>
                            <LogoutIcon fontSize="small" color="error" />
                          </ListItemIcon>
                          <Typography textAlign="center" color="error">
                            Cerrar Sesión
                          </Typography>
                        </MenuItem>
                      </Menu>
                    </Box>
                  </>
                )}

                {/* Mobile Menu Button */}
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{
                    display: { md: "none" },
                    ml: 1,
                    color: "secondary.main",
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>
      <Box component="nav">
        <Drawer
          anchor="right"
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 280,
              bgcolor: "transparent",
              borderRight: "1px solid rgba(197, 160, 89, 0.2)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
    </>
  );
};

export default Navbar;
