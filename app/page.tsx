"use client";

import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RemoveIcon from "@mui/icons-material/Remove";
import { useEffect, useState } from "react";

export default function Home() {
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  const data = {
    pm25: 42,
    pm10: 68,
    co2: 540,
    co: 3.2,
    ch4: 1.8,
    no2: 0.04,
    temperature: 29,
    humidity: 63,
    pressure: 1012,
    aqi: 87,
  };

  const getStatus = (value: number, type: string) => {
    if (type === "aqi") {
      if (value <= 50) return { label: "Good", color: "#1e88e5" };
      if (value <= 100) return { label: "Moderate", color: "#1565c0" };
      return { label: "Poor", color: "#0d47a1" };
    }
    if (value < 50) return { label: "Normal", color: "#1e88e5" };
    if (value < 100) return { label: "Elevated", color: "#1565c0" };
    return { label: "High", color: "#0d47a1" };
  };

  const getTrendIcon = (direction: string) => {
    if (direction === "up") return <ArrowUpwardIcon fontSize="small" />;
    if (direction === "down") return <ArrowDownwardIcon fontSize="small" />;
    return <RemoveIcon fontSize="small" />;
  };

  const getAQIGradient = (aqi: number) => {
    if (aqi <= 50) return "linear-gradient(135deg,#42a5f5,#1e88e5)";
    if (aqi <= 100) return "linear-gradient(135deg,#1e88e5,#1565c0)";
    return "linear-gradient(135deg,#1565c0,#0d47a1)";
  };

  return (
    <>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          System Overview
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Last Updated: {lastUpdated}
        </Typography>
      </Box>

      <Divider sx={{ marginY: 3 }} />

      {/* EXECUTIVE SUMMARY */}
      <Paper
        sx={{
          padding: 3,
          borderRadius: 3,
          backgroundColor: "background.paper",
          borderLeft: "6px solid #1565c0",
          marginBottom: 4,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Environmental Summary
        </Typography>
        <Typography variant="body2" sx={{ marginTop: 1 }}>
          Air quality remains within acceptable limits. Minor elevation detected in PM10 levels.
          All gas sensors operational. No abnormal environmental risk detected.
        </Typography>
      </Paper>

      {/* AQI BLOCK */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              padding: 3,
              borderRadius: 3,
              background: getAQIGradient(data.aqi),
              color: "#ffffff",
              boxShadow: "0px 6px 18px rgba(0,0,0,0.2)",
            }}
          >
            <Typography variant="subtitle2">Air Quality Index</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {data.aqi}
            </Typography>
            <Chip
              label={getStatus(data.aqi, "aqi").label}
              sx={{
                marginTop: 1,
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#ffffff",
              }}
            />
          </Paper>
        </Grid>

        {/* SYSTEM HEALTH */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              padding: 3,
              borderRadius: 3,
              backgroundColor: "background.paper",
              borderTop: "4px solid #1565c0",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              System Health
            </Typography>
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Device Status: Operational
            </Typography>
            <Typography variant="body2">
              Sensor Network: Active
            </Typography>
            <Typography variant="body2">
              Data Stream: Live
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ marginY: 4 }} />

      {/* PARAMETERS GRID */}
      <Grid container spacing={2}>
        <MetricCard title="PM2.5" unit="µg/m³" value={data.pm25} trend="up" />
        <MetricCard title="PM10" unit="µg/m³" value={data.pm10} trend="up" />
        <MetricCard title="CO₂" unit="ppm" value={data.co2} trend="stable" />
        <MetricCard title="CO" unit="ppm" value={data.co} trend="down" />
        <MetricCard title="CH₄" unit="ppm" value={data.ch4} trend="stable" />
        <MetricCard title="NO₂" unit="ppm" value={data.no2} trend="stable" />
        <MetricCard title="Temperature" unit="°C" value={data.temperature} trend="up" />
        <MetricCard title="Humidity" unit="%" value={data.humidity} trend="stable" />
        <MetricCard title="Pressure" unit="hPa" value={data.pressure} trend="stable" />
      </Grid>
    </>
  );
}

/* METRIC CARD */
function MetricCard({ title, value, unit, trend }: any) {
  const statusColor = value < 50 ? "#1e88e5" : value < 100 ? "#1565c0" : "#0d47a1";

  const TrendIcon =
    trend === "up"
      ? ArrowUpwardIcon
      : trend === "down"
      ? ArrowDownwardIcon
      : RemoveIcon;

  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <Paper
        sx={{
          padding: 2,
          borderRadius: 3,
          backgroundColor: "background.paper",
          borderTop: `4px solid ${statusColor}`,
          boxShadow: "0px 4px 12px rgba(21,101,192,0.15)",
          transition: "0.3s",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0px 8px 20px rgba(21,101,192,0.3)",
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {value} {unit}
          </Typography>
          <TrendIcon fontSize="small" />
        </Box>
      </Paper>
    </Grid>
  );
}