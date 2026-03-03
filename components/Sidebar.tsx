"use client";

import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";

const drawerWidth = 240;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { label: "System Overview", path: "/" },
    { label: "Trends & Graphs", path: "/trends" },
    { label: "AI Prediction", path: "/ai" },
    { label: "Reports", path: "/reports" },
    { label: "Team", path: "/team" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          mt: 8,
          display: "flex",
          flexDirection: "column",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#12263a" : "#f4f8ff",
        },
      }}
    >
      {/* -------- Menu Section -------- */}
      <Box sx={{ flexGrow: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 2,
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}