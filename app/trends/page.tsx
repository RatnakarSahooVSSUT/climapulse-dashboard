"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Brush,
  Legend,
} from "recharts";

import {
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Switch,
  Stack,
  Divider,
  Box,
} from "@mui/material";

import { useState, useEffect } from "react";

/* -------- Vibrant Professional Colors -------- */
const colors: any = {
  pm25: "#ff6f61",
  pm10: "#ff9800",
  co2: "#00acc1",
  co: "#8e24aa",
  ch4: "#43a047",
  no2: "#e53935",
  temp: "#3949ab",
  hum: "#26a69a",
  pressure: "#6d4c41",
  aqi: "#1976d2",
};

/* -------- Environmental Ranges -------- */
const ranges: any = {
  pm25: [0, 300],
  pm10: [0, 500],
  co2: [0, 2000],
  co: [0, 50],
  ch4: [0, 20],
  no2: [0, 1],
  temp: [0, 60],
  hum: [0, 100],
  pressure: [900, 1100],
  aqi: [0, 500],
};

/* -------- Generate Time Data -------- */
const generateData = (points: number) => {
  const now = new Date();
  return Array.from({ length: points }, (_, i) => {
    const time = new Date(now.getTime() - (points - i) * 60000);
    return {
      time: time.toLocaleTimeString(),
      aqi: 50 + Math.random() * 100,
      pm25: 30 + Math.random() * 30,
      pm10: 50 + Math.random() * 40,
      co2: 500 + Math.random() * 150,
      co: 2 + Math.random() * 3,
      ch4: 1 + Math.random() * 2,
      no2: 0.03 + Math.random() * 0.05,
      temp: 26 + Math.random() * 5,
      hum: 55 + Math.random() * 10,
      pressure: 1008 + Math.random() * 6,
    };
  });
};

export default function TrendsPage() {
  const [timeRange, setTimeRange] = useState("1H");
  const [aqiRange, setAqiRange] = useState("1H");
  const [overlayMode, setOverlayMode] = useState(false);
  const [selectedParams, setSelectedParams] = useState<string[]>(["pm25"]);
  const [data, setData] = useState(generateData(60));
  const [aqiData, setAqiData] = useState(generateData(60));

  /* -------- AQI Time Filtering -------- */
  useEffect(() => {
    if (aqiRange === "30M") setAqiData(generateData(30));
    if (aqiRange === "1H") setAqiData(generateData(60));
    if (aqiRange === "6H") setAqiData(generateData(360));
    if (aqiRange === "24H") setAqiData(generateData(1440));
  }, [aqiRange]);

  /* -------- Main Time Filtering -------- */
  useEffect(() => {
    if (timeRange === "30M") setData(generateData(30));
    if (timeRange === "1H") setData(generateData(60));
    if (timeRange === "6H") setData(generateData(360));
    if (timeRange === "24H") setData(generateData(1440));
  }, [timeRange]);

  /* -------- Parameter Selection Logic -------- */
  const handleParamSelect = (event: any, newParams: any) => {
    if (!overlayMode) {
      if (!newParams) return;
      setSelectedParams([newParams]);
    } else {
      if (newParams.length > 2) return;
      setSelectedParams(newParams);
    }
  };

  const leftParam = selectedParams[0];
  const rightParam =
    overlayMode && selectedParams.length > 1 ? selectedParams[1] : null;

  return (
    <>
      {/* ================= AQI SECTION ================= */}
      <Typography variant="h4" sx={{ fontWeight: 600 }} gutterBottom>
        AQI Trend Analysis
      </Typography>

      <Stack direction="row" spacing={3} sx={{ marginBottom: 3 }}>
        <ToggleButtonGroup
          value={aqiRange}
          exclusive
          onChange={(e, value) => value && setAqiRange(value)}
        >
          <ToggleButton value="30M">30 Min</ToggleButton>
          <ToggleButton value="1H">1 Hour</ToggleButton>
          <ToggleButton value="6H">6 Hours</ToggleButton>
          <ToggleButton value="24H">24 Hours</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Paper
        sx={{
          padding: 3,
          borderRadius: 3,
          marginBottom: 5,
          borderTop: "5px solid #1976d2",
        }}
      >
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={aqiData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={ranges.aqi} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke={colors.aqi}
              strokeWidth={4}
              dot={false}
              isAnimationActive
            />
            <Brush dataKey="time" height={30} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      <Divider sx={{ marginBottom: 5 }} />

      {/* ================= EXISTING PARAMETER SECTION ================= */}

      <Typography variant="h4" sx={{ fontWeight: 600 }} gutterBottom>
        Parameter Trends
      </Typography>

      <Stack direction="row" spacing={3} sx={{ marginBottom: 3 }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(e, value) => value && setTimeRange(value)}
        >
          <ToggleButton value="30M">30 Min</ToggleButton>
          <ToggleButton value="1H">1 Hour</ToggleButton>
          <ToggleButton value="6H">6 Hours</ToggleButton>
          <ToggleButton value="24H">24 Hours</ToggleButton>
        </ToggleButtonGroup>

        <FormControlLabel
          control={
            <Switch
              checked={overlayMode}
              onChange={(e) => {
                setOverlayMode(e.target.checked);
                if (!e.target.checked) {
                  setSelectedParams([selectedParams[0]]);
                }
              }}
            />
          }
          label="Overlay Mode"
        />
      </Stack>

      <ToggleButtonGroup
        value={overlayMode ? selectedParams : selectedParams[0]}
        exclusive={!overlayMode}
        onChange={handleParamSelect}
        sx={{ flexWrap: "wrap", marginBottom: 3 }}
      >
        {Object.keys(colors)
          .filter((k) => k !== "aqi")
          .map((key) => (
            <ToggleButton
              key={key}
              value={key}
              sx={{
                color: colors[key],
                borderColor: colors[key],
                "&.Mui-selected": {
                  backgroundColor: colors[key],
                  color: "#fff",
                },
              }}
            >
              {key.toUpperCase()}
            </ToggleButton>
          ))}
      </ToggleButtonGroup>

      <Paper sx={{ padding: 3, borderRadius: 3 }}>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />

            <YAxis
              yAxisId="left"
              domain={ranges[leftParam]}
              stroke={colors[leftParam]}
            />

            {rightParam && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={ranges[rightParam]}
                stroke={colors[rightParam]}
              />
            )}

            <Tooltip />
            <Legend />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey={leftParam}
              stroke={colors[leftParam]}
              strokeWidth={3}
              dot={false}
            />

            {rightParam && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={rightParam}
                stroke={colors[rightParam]}
                strokeWidth={3}
                dot={false}
              />
            )}

            <Brush dataKey="time" height={30} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </>
  );
}