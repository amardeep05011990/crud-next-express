import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Breadcrumbs
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const drawerWidth = 240;

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const menuItems = [
    { text: "Dashboard", icon: <HomeIcon />, path: "/" },
    { text: "Students", icon: <AddBoxIcon />, path: "/students" },
    { text: "All Forms", icon: <FormatListBulletedIcon />, path: "/formbuilder/list" },
    { text: "Drawing Tools", icon: <FormatListBulletedIcon />, path: "/draw" },
    { text: "Display Forms", icon: <FormatListBulletedIcon />, path: "/df" },
  ];

  const drawer = (
    <Box sx={{ width: drawerWidth, bgcolor: "#3F51B5", height: "100vh", color: "white" }}>
      <Typography variant="h6" sx={{ p: 2, textAlign: "center" }}>
        Form Builder
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <Drawer
        variant="permanent"
        sx={{ width: drawerWidth, flexShrink: 0, display: { xs: "none", md: "block" } }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        {drawer}
      </Drawer>

      <Box sx={{ flexGrow: 1, p: 3, ml: { md: `${drawerWidth}px` }, width: "100%" }}>
        <AppBar position="fixed" sx={{ ml: { md: `${drawerWidth}px` }, bgcolor: "#3F51B5" }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" sx={{ mr: 2, display: { md: "none" } }} onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Form Builder
            </Typography>

            <IconButton color="inherit" onClick={handleMenuOpen}>
              <Avatar sx={{ bgcolor: "#FF9800" }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ExitToAppIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
