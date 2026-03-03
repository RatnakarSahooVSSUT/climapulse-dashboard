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

import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "sensor_data"),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const firestoreData = doc.data();

        setData(firestoreData);
        setIsLive(true);

        if (firestoreData.timestamp) {
          setLastUpdated(
            firestoreData.timestamp.toDate().toLocaleString()
          );
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (!data) return <Typography>Loading live data...</Typography>;

  const formatValue = (val: any) =>
    typeof val === "number" ? Number(val.toFixed(3)) : val;

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
          Real-time monitoring active. Sensor data streaming from device.
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
              {formatValue(data.aqi)}
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
              Device Status: {isLive ? "Operational" : "Offline"}
            </Typography>
            <Typography variant="body2">
              Sensor Network: {isLive ? "Active" : "Disconnected"}
            </Typography>
            <Typography variant="body2">
              Data Stream: {isLive ? "Live" : "Stopped"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ marginY: 4 }} />

      {/* PARAMETERS GRID */}
      <Grid container spacing={2}>
        <MetricCard title="PM2.5" unit="µg/m³" value={formatValue(data.pm25)} />
        <MetricCard title="PM10" unit="µg/m³" value={formatValue(data.pm10)} />
        <MetricCard title="CO₂" unit="ppm" value={formatValue(data.co2)} />
        <MetricCard title="CO" unit="ppm" value={formatValue(data.co)} />
        <MetricCard title="CH₄" unit="ppm" value={formatValue(data.ch4)} />
        <MetricCard title="NO₂" unit="ppm" value={formatValue(data.no2)} />
        <MetricCard title="Temperature" unit="°C" value={formatValue(data.temperature)} />
        <MetricCard title="Humidity" unit="%" value={formatValue(data.humidity)} />
        <MetricCard title="Pressure" unit="hPa" value={formatValue(data.pressure)} />
      </Grid>
    </>
  );
}

/* METRIC CARD */
function MetricCard({ title, value, unit }: any) {
  const statusColor =
    value < 50 ? "#1e88e5" : value < 100 ? "#1565c0" : "#0d47a1";

  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <Paper
        sx={{
          padding: 2,
          borderRadius: 3,
          backgroundColor: "background.paper",
          borderTop: `4px solid ${statusColor}`,
          boxShadow: "0px 4px 12px rgba(21,101,192,0.15)",
        }}
      >
        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
          {title}
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {value} {unit}
        </Typography>
      </Paper>
    </Grid>
  );
}