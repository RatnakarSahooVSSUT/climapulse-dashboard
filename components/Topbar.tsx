"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

interface Props {
  darkMode: boolean;
  toggleDark: () => void;
}

export default function Topbar({ darkMode, toggleDark }: Props) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,

        // 🎨 Premium adaptive background
        backdropFilter: "blur(12px)",
        background: darkMode
          ? "rgba(2,6,23,0.8)"
          : "rgba(21,101,192,0.95)",

        borderBottom: darkMode
          ? "1px solid #1e293b"
          : "1px solid rgba(255,255,255,0.2)",

        boxShadow: darkMode
          ? "0 0 15px rgba(0,0,0,0.6)"
          : "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ display: "flex", alignItems: "center" }}>
        
        {/* 🔷 LOGO + TITLE */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            component="img"
            src="/logos/climapulse.jpeg"
            alt="ClimaPulse"
            sx={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              objectFit: "cover",
              border: darkMode
                ? "1px solid #0ea5e9"
                : "1px solid rgba(255,255,255,0.6)",

              boxShadow: darkMode
                ? "0 0 10px rgba(14,165,233,0.6)"
                : "0 2px 6px rgba(0,0,0,0.15)",
            }}
          />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
          >
            ClimaPulse Dashboard
          </Typography>
        </Box>

        {/* 🔷 RIGHT SIDE */}
        <Box sx={{ flexGrow: 1 }} />

        {/* 🌗 THEME TOGGLE */}
        <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          <IconButton
            onClick={toggleDark}
            sx={{
              color: "#fff",
              borderRadius: "12px",
              transition: "0.3s",

              background: darkMode
                ? "rgba(14,165,233,0.15)"
                : "rgba(255,255,255,0.2)",

              "&:hover": {
                transform: "rotate(20deg) scale(1.1)",

                background: darkMode
                  ? "rgba(14,165,233,0.3)"
                  : "rgba(255,255,255,0.35)",

                boxShadow: darkMode
                  ? "0 0 10px #0ea5e9"
                  : "0 0 6px rgba(255,255,255,0.6)",
              },
            }}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}