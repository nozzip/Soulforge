/// <reference lib="dom" />
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ViewState, Product } from '../types';
import { useCart } from '../context/CartContext';
import {
  AppBar, Toolbar, IconButton, Button, InputBase, Badge,
  Menu, MenuItem, Drawer, List, ListItem, ListItemText, ListItemButton,
  Box, Typography, useTheme, Container, ListItemIcon,
  Paper, ClickAwayListener, Backdrop, Fade, ListSubheader
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ShoppingBag as ShoppingBagIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Construction as ConstructionIcon,
  Token as TokenIcon,
  Security as SecurityIcon,
  Map as MapIcon,
  ArrowForward as ArrowForwardIcon,
  RssFeed as RssFeedIcon,
  Share as ShareIcon,
  Forum as ForumIcon
} from '@mui/icons-material';

// Styled Components
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.secondary.main,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.common.white,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

interface LayoutProps {
  children: React.ReactNode;
  setView: (view: ViewState) => void;
  currentView: ViewState;
  onSearch: (query: string) => void;
  onProductSelect: (id: string) => void;
  user?: string | null;
  onLogout?: () => void;
  products: Product[];
  isWarhammer: boolean;
  onToggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  setView,
  currentView,
  onSearch,
  onProductSelect,
  user,
  onLogout,
  products,
  isWarhammer,
  onToggleTheme
}) => {
  const theme = useTheme();
  const { totalItems } = useCart();
  const [searchInput, setSearchInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchInput);
      setIsFocused(false);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleSearchClick = () => {
    onSearch(searchInput);
  };

  const handleSuggestionClick = (productId: string) => {
    onProductSelect(productId);
    setIsFocused(false);
    setSearchInput('');
  };

  const searchSuggestions = useMemo(() => {
    if (!searchInput.trim()) return [];
    const lowerQuery = searchInput.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);
  }, [searchInput, products]);

  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', height: '100%', bgcolor: 'background.default', color: 'text.primary' }}>
      <Typography variant="h6" sx={{ my: 2, fontFamily: 'Cinzel, serif', fontWeight: 'bold', letterSpacing: 2 }}>
        MENU
      </Typography>
      <Box sx={{ px: 2, mb: 2, position: 'relative' }}>
        <Search onClick={(e) => e.stopPropagation()}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search archives..."
            inputProps={{ 'aria-label': 'search' }}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
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
            <ListItemIcon sx={{ color: 'secondary.main' }}>
              {isWarhammer ? <ConstructionIcon /> : <TokenIcon /> /* Using generic icons for swords/skull substitution */}
            </ListItemIcon>
            <ListItemText primary={isWarhammer ? 'Switch to Fantasy' : 'Switch to Grimdark'} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setView(ViewState.CATALOG)}>
            <ListItemText primary="CATALOG" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setView(ViewState.ADMIN)}>
            <ListItemText primary="ADMIN" />
          </ListItemButton>
        </ListItem>
        {user ? (
          <>
            <ListSubheader sx={{ bgcolor: 'transparent', color: 'secondary.main', mt: 2 }}>
              Signed in as {user}
            </ListSubheader>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setView(ViewState.WISHLIST)}>
                <ListItemIcon><FavoriteIcon sx={{ color: 'secondary.main' }} /></ListItemIcon>
                <ListItemText primary="Wishlist" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setView(ViewState.ORDERS)}>
                <ListItemIcon><HistoryIcon sx={{ color: 'secondary.main' }} /></ListItemIcon>
                <ListItemText primary="Orders" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { if (onLogout) onLogout(); }}>
                <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton onClick={() => setView(ViewState.LOGIN)} sx={{ mt: 2, bgcolor: 'secondary.main', color: 'background.default', '&:hover': { bgcolor: 'primary.main' } }}>
              <ListItemText primary="LOGIN / JOIN GUILD" sx={{ textAlign: 'center', fontWeight: 'bold' }} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', color: 'text.primary' }}>
      <AppBar position="sticky" sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'rgba(197, 160, 89, 0.3)', backdropFilter: 'blur(10px)' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo / Home */}
            <Button
              onClick={() => setView(ViewState.HOME)}
              sx={{ color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1, '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}
            >
              {isCheckout ? <TokenIcon fontSize="large" /> : (
                <Box component="div" sx={{ width: 32, height: 32 }}>
                  <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16zM22 12h4v12h-4V12zm0 16h4v4h-4v-4z"></path>
                  </svg>
                </Box>
              )}
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: '.1rem', fontFamily: 'Cinzel, serif', textTransform: 'uppercase' }}>
                ResinForge
              </Typography>
            </Button>

            {/* Desktop Nav */}
            {!isCheckout && (
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4, gap: 2 }}>
                <Button
                  onClick={() => setView(ViewState.CATALOG)}
                  sx={{ my: 2, color: currentView === ViewState.CATALOG ? 'primary.main' : 'text.primary', display: 'block', letterSpacing: 2, borderBottom: currentView === ViewState.CATALOG ? 2 : 0 }}
                >
                  Catalog
                </Button>
                <Button
                  onClick={() => setView(ViewState.ADMIN)}
                  startIcon={<ConstructionIcon />}
                  sx={{ my: 2, color: currentView === ViewState.ADMIN ? 'primary.main' : 'text.primary', display: 'flex', letterSpacing: 2, borderBottom: currentView === ViewState.ADMIN ? 2 : 0 }}
                >
                  Admin
                </Button>
              </Box>
            )}

            {/* Right Side Actions */}
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
              {isCheckout ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'secondary.main', display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                    <SecurityIcon fontSize="small" /> Enchanted Encryption Active
                  </Typography>
                  <Button
                    startIcon={<MapIcon />}
                    onClick={() => setView(ViewState.CART)}
                    sx={{ color: 'secondary.main' }}
                  >
                    Back
                  </Button>
                </Box>
              ) : (
                <>
                  {/* Search */}
                  <Box sx={{ display: { xs: 'none', md: 'block' } }} ref={searchContainerRef}>
                    <ClickAwayListener onClickAway={() => setIsFocused(false)}>
                      <Box>
                        <Search>
                          <SearchIconWrapper>
                            <SearchIcon />
                          </SearchIconWrapper>
                          <StyledInputBase
                            placeholder="Search the archives..."
                            inputProps={{ 'aria-label': 'search' }}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onKeyDown={handleKeyDown}
                          />
                          <IconButton
                            size="small"
                            sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', color: 'secondary.main' }}
                            onClick={handleSearchClick}
                          >
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        </Search>

                        {/* Search Preview Dropdown */}
                        {isFocused && searchInput.trim().length > 0 && (
                          <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, mt: 1, zIndex: 10, bgcolor: 'background.paper', border: 1, borderColor: 'secondary.main' }}>
                            <List dense>
                              {searchSuggestions.length > 0 ? (
                                <>
                                  {searchSuggestions.map((product) => (
                                    <ListItem key={product.id} disablePadding>
                                      <ListItemButton onClick={() => handleSuggestionClick(product.id)}>
                                        <Box component="img" src={product.image} sx={{ width: 40, height: 40, mr: 2, objectFit: 'cover', borderRadius: 1 }} />
                                        <ListItemText
                                          primary={product.name}
                                          secondary={<Typography variant="caption" sx={{ color: 'secondary.main' }}>{product.category} • {product.price} GP</Typography>}
                                        />
                                      </ListItemButton>
                                    </ListItem>
                                  ))}
                                  <ListItem disablePadding>
                                    <ListItemButton onClick={handleSearchClick} sx={{ justifyContent: 'center' }}>
                                      <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>VIEW ALL RESULTS</Typography>
                                    </ListItemButton>
                                  </ListItem>
                                </>
                              ) : (
                                <ListItem>
                                  <ListItemText secondary={`No artifacts found matching "${searchInput}"`} sx={{ fontStyle: 'italic', textAlign: 'center' }} />
                                </ListItem>
                              )}
                            </List>
                          </Paper>
                        )}
                      </Box>
                    </ClickAwayListener>
                  </Box>

                  {/* Theme Toggle */}
                  <IconButton onClick={onToggleTheme} color="inherit" title={isWarhammer ? "Return to Fantasy" : "Activate Grimdark Protocol"}>
                    {isWarhammer ? <ConstructionIcon /> : <TokenIcon /> /* TODO: Better icons for skull/swords */}
                  </IconButton>

                  {/* Cart */}
                  <IconButton onClick={() => setView(ViewState.CART)} color="inherit">
                    <Badge badgeContent={totalItems} color="primary">
                      <ShoppingBagIcon />
                    </Badge>
                  </IconButton>

                  {/* User Menu */}
                  <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1, border: user ? 1 : 0, borderColor: 'secondary.main' }}>
                      {user ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 1, gap: 1 }}>
                          <PersonIcon sx={{ color: 'secondary.main' }} />
                          <Typography variant="button" sx={{ color: 'text.primary', display: { xs: 'none', lg: 'block' } }}>{user}</Typography>
                        </Box>
                      ) : (
                        <PersonIcon />
                      )}
                    </IconButton>
                    <Menu
                      sx={{ mt: '45px' }}
                      id="menu-appbar"
                      anchorEl={anchorElUser}
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                      keepMounted
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      open={Boolean(anchorElUser)}
                      onClose={handleCloseUserMenu}
                    >
                      <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">Signed in as</Typography>
                        <Typography variant="subtitle2">{user}</Typography>
                      </Box>
                      <MenuItem onClick={() => { setView(ViewState.WISHLIST); handleCloseUserMenu(); }}>
                        <ListItemIcon><FavoriteIcon fontSize="small" /></ListItemIcon>
                        <Typography textAlign="center">My Wishlist</Typography>
                      </MenuItem>
                      <MenuItem onClick={() => { setView(ViewState.ORDERS); handleCloseUserMenu(); }}>
                        <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                        <Typography textAlign="center">My Orders</Typography>
                      </MenuItem>
                      <MenuItem onClick={() => { if (onLogout) onLogout(); handleCloseUserMenu(); }}>
                        <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                        <Typography textAlign="center" color="error">Log Out</Typography>
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
                sx={{ display: { md: 'none' }, ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, bgcolor: 'background.default' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'background.default', borderTop: 1, borderColor: 'secondary.main', py: 6, px: 2, mt: 'auto' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 4 }}>
            <Box>
              <Typography variant="h6" color="secondary.main" gutterBottom sx={{ fontFamily: 'Cinzel, serif' }}>RESINFORGE</Typography>
              <Typography variant="body2" color="text.secondary">
                The premiere destination for high-fidelity 3D resin prints. Designed by gamers, for gamers.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="common.white" gutterBottom sx={{ letterSpacing: 2 }}>ARCHIVES</Typography>
              <List dense disablePadding>
                {['Catalogues', 'Limited Editions', 'Subscription Box', 'Painting Guides'].map((text) => (
                  <ListItem key={text} disablePadding sx={{ py: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main', cursor: 'pointer' } }}>{text}</Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="common.white" gutterBottom sx={{ letterSpacing: 2 }}>LORE & LAW</Typography>
              <List dense disablePadding>
                {['Shipping Rituals', 'The Alchemist\'s Oath', 'Merchant Scrolls', 'Privacy Sigil'].map((text) => (
                  <ListItem key={text} disablePadding sx={{ py: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main', cursor: 'pointer' } }}>{text}</Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="common.white" gutterBottom sx={{ letterSpacing: 2 }}>DISPATCH</Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontStyle: 'italic' }}>
                Subscribe for new drop alerts.
              </Typography>
              <Box sx={{ display: 'flex' }}>
                <InputBase
                  placeholder="Email"
                  sx={{ bgcolor: 'background.paper', px: 2, py: 0.5, borderRadius: '4px 0 0 4px', border: 1, borderColor: 'secondary.main', color: 'common.white', width: '100%' }}
                />
                <Button variant="contained" sx={{ borderRadius: '0 4px 4px 0' }}>Join</Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <RssFeedIcon sx={{ color: 'secondary.main', '&:hover': { color: 'white' }, cursor: 'pointer' }} />
                <ShareIcon sx={{ color: 'secondary.main', '&:hover': { color: 'white' }, cursor: 'pointer' }} />
                <ForumIcon sx={{ color: 'secondary.main', '&:hover': { color: 'white' }, cursor: 'pointer' }} />
              </Box>
            </Box>
          </Box>
          <Typography variant="caption" display="block" align="center" sx={{ mt: 8, pt: 4, borderTop: 1, borderColor: 'rgba(197, 160, 89, 0.1)', color: 'text.secondary', letterSpacing: 2 }}>
            © 2024 ResinForge Miniatures. All Rights Reserved. Not a Wizard of the Coast product.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;