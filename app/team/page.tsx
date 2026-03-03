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
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";

const teamMembers = [
  {
    name: "Ratnakar Sahoo",
    role: "Full Stack & Embedded Systems Lead",
    image: "/team/Ratnakar.jpg",
  },
  {
    name: "Priyadarshani Mahapatra",
    role: "Research & System Design",
    image: "/team/priyadarshani.jpg",
  },
  {
    name: "Sohan Kumar Nayak",
    role: "Data & Hardware Integration",
    image: "/team/sohan.jpg",
  },
  {
    name: "Pritam Das Adhikari",
    role: "Deployment & Testing",
    image: "/team/pritam.jpg",
  },
];

export default function TeamPage() {
  return (
    <>
      {/* Page Header */}
      <Typography variant="h4" sx={{ fontWeight: 600 }} gutterBottom>
        ClimaPulse - Development Team
      </Typography>

      {/* Project + Team Info */}
      <Paper sx={{ padding: 4, borderRadius: 3, mb: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Project: ClimaPulse
        </Typography>

        <Typography
          variant="h6"
          sx={{ mt: 1, color: "#1565c0", fontWeight: 500 }}
        >
          Team: TatvaNova
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
          TatvaNova is the core development team behind ClimaPulse - an advanced
          environmental monitoring and analytics platform designed for real-time
          atmospheric sensing, predictive modeling, and structured reporting.
          The team integrates embedded systems, IoT architecture, data analytics,
          and scalable web technologies to deliver intelligent environmental
          solutions.
        </Typography>
      </Paper>

      {/* Team Members Section */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Team Members
      </Typography>

      <Grid container spacing={4}>
        {teamMembers.map((member) => (
          <Grid key={member.name} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                height: 360,
                padding: 3,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                textAlign: "center",
                transition: "0.3s",
                "&:hover": {
                  boxShadow: 8,
                  transform: "translateY(-6px)",
                },
              }}
            >
              {/* Avatar */}
              <Avatar
                src={member.image}
                alt={member.name}
                sx={{
                  width: 120,
                  height: 120,
                  border: "3px solid #1565c0",
                  mb: 2,
                }}
              />

              {/* Name */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  minHeight: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {member.name}
              </Typography>

              {/* Role */}
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  minHeight: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {member.role}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Contact Section */}
      <Paper sx={{ padding: 4, borderRadius: 3, mt: 6 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Help & Contact
        </Typography>

        <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.8 }}>
          For technical queries, collaboration requests, or deployment inquiries
          regarding ClimaPulse, please contact:
        </Typography>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 3 }}>
          <EmailIcon sx={{ color: "#1565c0" }} />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            sahooratnakar2006@gmail.com
          </Typography>
        </Stack>

        <Button
          variant="contained"
          sx={{ mt: 3 }}
          href="mailto:sahooratnakar2006@gmail.com"
        >
          Contact via Email
        </Button>
      </Paper>
    </>
  );
}