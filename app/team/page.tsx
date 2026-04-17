"use client";

import {
  Typography,
  Paper,
  Box,
  Grid,
  Avatar,
  Divider,
  Stack,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useTheme } from "@mui/material/styles";

const teamMembers = [
  {
    name: "Ratnakar Sahoo",
    role: "Full Stack & Embedded Systems Lead",
    image: "/team/ratnakar.jpg",
    email: "mailto:sahooratnakar2006@gmail.com",
    linkedin: "https://www.linkedin.com/in/ratnakar-sahoo-074b10293/",
    github: "https://github.com/RatnakarSahooVSSUT",
  },
  {
    name: "Priyadarshani Mahapatra",
    role: "Research & System Design",
    image: "/team/priyadarshani.jpg",
    email: "mailto:mahapatrapriyadarshani2005@gmail.com",
    linkedin: "https://www.linkedin.com/in/priyadarshani-mahapatra-2a15a8313/",
    github: "#",
  }
];

export default function TeamPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  /* 🌫️ GLASS */
  const glass = {
    backdropFilter: "blur(10px)",
    background: isDark
      ? "rgba(15,23,42,0.55)"
      : "rgba(255,255,255,0.7)",
  };

  /* ✨ SUBTLE NEON */
  const neon = (color: string) => ({
    border: `1px solid ${color}`,
    boxShadow: `0 0 6px ${color}33`,
    transition: "0.3s",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: `0 0 12px ${color}55`,
    },
  });

  /* 🔘 ICON STYLE */
  const iconStyle = {
    transition: "0.25s",
    "&:hover": {
      transform: "scale(1.15)",
    },
  };

  return (
    <>
      {/* HEADER */}
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
        ClimaPulse - Development Team
      </Typography>

      {/* PROJECT INFO */}
      <Paper sx={{ p: 4, borderRadius: 4, mb: 5, ...glass, ...neon("#6366f1") }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">

          {/* LOGOS */}
          <Box display="flex" gap={2}>
            <img
              src="/logos/climapulse.jpeg"
              alt="ClimaPulse"
              style={{ width: 50, height: 50, borderRadius: 10 }}
            />
            <img
              src="/logos/tatvanova.jpeg"
              alt="TatvaNova"
              style={{ width: 50, height: 50, borderRadius: 10 }}
            />
          </Box>

          {/* TEXT */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Project: ClimaPulse
            </Typography>
            <Typography variant="h6" sx={{ color: "#6366f1" }}>
              Team: TatvaNova
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography sx={{ lineHeight: 1.8 }}>
          TatvaNova is the core development team behind ClimaPulse - an advanced
          environmental monitoring and analytics platform designed for real-time
          sensing and intelligent analytics.
        </Typography>
      </Paper>

      {/* TEAM */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Team Members
      </Typography>

      <Grid container spacing={4}>
        {teamMembers.map((member, i) => (
          <Grid key={member.name} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                height: 380,
                p: 3,
                borderRadius: 4,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                ...glass,
                ...neon(i % 2 === 0 ? "#00ff9c" : "#6366f1"),
              }}
            >
              {/* AVATAR */}
              <Avatar
                src={member.image}
                alt={member.name}
                sx={{
                  width: 110,
                  height: 110,
                  border: "2px solid #00ff9c",
                }}
              />

              {/* NAME */}
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {member.name}
              </Typography>

              {/* ROLE */}
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {member.role}
              </Typography>

              {/* ICONS */}
              <Stack direction="row" spacing={2}>
                
                <Tooltip title="Email">
                  <IconButton href={member.email} sx={{ color: "#00ff9c", ...iconStyle }}>
                    <EmailIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="LinkedIn">
                  <IconButton
                    href={member.linkedin}
                    target="_blank"
                    sx={{ color: "#0a66c2", ...iconStyle }}
                  >
                    <LinkedInIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="GitHub">
                  <IconButton
                    href={member.github}
                    target="_blank"
                    sx={{
                      color: isDark ? "#fff" : "#000",
                      ...iconStyle,
                    }}
                  >
                    <GitHubIcon />
                  </IconButton>
                </Tooltip>

              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* CONTACT */}
      <Paper sx={{ p: 4, borderRadius: 4, mt: 6, ...glass, ...neon("#00ff9c") }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Help & Contact
        </Typography>

        <Typography sx={{ mt: 2 }}>
          For technical queries or collaboration, contact:
        </Typography>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 3 }}>
          <EmailIcon sx={{ color: "#00ff9c" }} />
          <Typography sx={{ fontWeight: 500 }}>
            sahooratnakar2006@gmail.com
          </Typography>
        </Stack>

        <Button
          variant="contained"
          sx={{
            mt: 3,
            background: "linear-gradient(135deg,#00ff9c,#6366f1)",
          }}
          href="mailto:sahooratnakar2006@gmail.com"
        >
          Contact via Email
        </Button>
      </Paper>
    </>
  );
}