"use client";

import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Menu as MenuIcon,
  Dashboard,
  ShowChart,
  SmartToy,
  Insights,
  Description,
  Group,
} from "@mui/icons-material";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";

const expandedWidth = 240;
const collapsedWidth = 70;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { label: "System Overview", path: "/", icon: <Dashboard /> },
    { label: "Trends & Graphs", path: "/trends", icon: <ShowChart /> },
    { label: "AI Prediction", path: "/ai", icon: <SmartToy /> },
    { label: "Pollutant Insights", path: "/pollutant_insights", icon: <Insights /> },
    { label: "Reports", path: "/reports", icon: <Description /> },
    { label: "Team", path: "/team", icon: <Group /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? collapsedWidth : expandedWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: collapsed ? collapsedWidth : expandedWidth,
          transition: "width 0.3s ease",
          overflowX: "hidden",
          mt: 8,
          display: "flex",
          flexDirection: "column",

          // 🎯 Glass + Theme Adaptive
          background: isDark ? "#020617" : "#ffffff",
          borderRight: isDark
            ? "1px solid #1e293b"
            : "1px solid #e5e7eb",

          boxShadow: isDark
            ? "0 0 20px rgba(0,0,0,0.6)"
            : "0 4px 20px rgba(0,0,0,0.06)",
        },
      }}
    >
      {/* 🔷 Collapse Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-end",
          p: 1,
        }}
      >
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            color: isDark ? "#94a3b8" : "#475569",

            "&:hover": {
              backgroundColor: isDark
                ? "rgba(59,130,246,0.15)"
                : "rgba(59,130,246,0.1)",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* 🔷 MENU */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <List>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;

            const content = (
              <ListItemButton
                key={item.path}
                onClick={() => router.push(item.path)}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  transition: "all 0.25s ease",

                  color: isActive
                    ? "#0ea5e9"
                    : isDark
                    ? "#cbd5e1"
                    : "#334155",

                  // 🌟 Hover
                  "&:hover": {
                    backgroundColor: isDark
                      ? "rgba(14,165,233,0.12)"
                      : "rgba(14,165,233,0.08)",

                    transform: "translateX(4px)",
                  },

                  // 🔥 Active Item (Premium Highlight)
                  ...(isActive && {
                    backgroundColor: isDark
                      ? "rgba(14,165,233,0.18)"
                      : "rgba(14,165,233,0.12)",

                    borderLeft: "4px solid #0ea5e9",

                    boxShadow: isDark
                      ? "0 0 10px rgba(14,165,233,0.4)"
                      : "none",
                  }),
                }}
              >
                {/* ICON */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",

                    color: isActive
                      ? "#0ea5e9"
                      : isDark
                      ? "#94a3b8"
                      : "#64748b",
                  }}
                >
                  {item.icon}
                </Box>

                {/* TEXT */}
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.95rem",
                    }}
                  />
                )}
              </ListItemButton>
            );

            return collapsed ? (
              <Tooltip title={item.label} placement="right" key={item.path}>
                {content}
              </Tooltip>
            ) : (
              content
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}