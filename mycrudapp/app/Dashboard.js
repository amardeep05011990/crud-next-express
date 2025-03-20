"use client";

import { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Divider,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";

import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  MonetizationOn as RevenueIcon,
  BarChart as ChartIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";

// Dummy Data
const stats = [
  { icon: <PeopleIcon />, title: "Total Users", value: "12,345" },
  { icon: <RevenueIcon />, title: "Revenue", value: "$45,678" },
  { icon: <ChartIcon />, title: "Orders", value: "678" },
];

// Sidebar Items
const sidebarItems = [
  { text: "Dashboard", icon: <DashboardIcon /> },
  { text: "Users", icon: <PeopleIcon /> },
  { text: "Reports", icon: <ChartIcon /> },
];

// Chart Data
const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Monthly Revenue",
      data: [4000, 8000, 6000, 12000, 9000, 14000],
      borderColor: "#007bff",
      backgroundColor: "rgba(0, 123, 255, 0.2)",
    },
  ],
};

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Sidebar */}
      {/* <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box", background: "#1976d2", color: "white" },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {sidebarItems.map((item, index) => (
            <ListItem button key={index}>
              <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer> */}

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
        {/* <AppBar position="static" color="inherit" elevation={1} sx={{ mb: 2 }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(!open)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
              sx={{ mr: 2, backgroundColor: "white", borderRadius: 1 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
            <IconButton color="inherit" onClick={handleMenuClick}>
              <Avatar sx={{ bgcolor: "#007bff" }}><AccountCircleIcon /></Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar> */}

        {/* Stats Cards */}
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper sx={{ p: 3, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {stat.icon}
                <Typography variant="h6">{stat.title}</Typography>
                <Typography variant="h4">{stat.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Chart Section */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6">Revenue Overview</Typography>
          <Line data={chartData} />
        </Paper>
      </Box>
    </Box>
  );
}
