"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useState } from "react";

interface Props {
  darkMode: boolean;
  toggleDark: () => void;
}

export default function Topbar({ darkMode, toggleDark }: Props) {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: darkMode ? "#0d2b45" : "#1565c0",
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          ClimaPulse Dashboard
        </Typography>

        <IconButton color="inherit" onClick={toggleDark}>
          <DarkModeIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}