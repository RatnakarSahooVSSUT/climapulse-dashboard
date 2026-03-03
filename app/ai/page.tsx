"use client";

import {
  Typography,
  Paper,
  Box,
  Grid,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
} from "@mui/material";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { useState, useEffect } from "react";

/* ---------- Forecast Generator (Client Only) ---------- */
const generateForecast = (points: number) =>
  Array.from({ length: points }, (_, i) => ({
    hour: `+${i + 1}h`,
    aqi: 95 + Math.random() * 40,
    temp: 33 + Math.random() * 5,
  }));

export default function AIPredictionPage() {
  const [timeRange, setTimeRange] = useState("6H");
  const [forecastData, setForecastData] = useState<any[]>([]);

  /* ---------- Generate Forecast ONLY on Client ---------- */
  useEffect(() => {
    if (timeRange === "3H") setForecastData(generateForecast(3));
    else if (timeRange === "12H") setForecastData(generateForecast(12));
    else setForecastData(generateForecast(6));
  }, [timeRange]);

  /* ---------- Current Values (Replace with Live Data Later) ---------- */
  const currentAQI: number = 102;
  const currentTemp: number = 34;

  /* ---------- Safe Predicted Values ---------- */
  const predictedAQI =
    forecastData.length > 0
      ? forecastData[forecastData.length - 1].aqi
      : 0;

  const predictedTemp =
    forecastData.length > 0
      ? forecastData[forecastData.length - 1].temp
      : 0;

  const aqiChange =
    currentAQI !== 0
      ? ((predictedAQI - currentAQI) / currentAQI) * 100
      : 0;

  const tempChange = predictedTemp - currentTemp;

  const aqiConfidence = 84;
  const tempConfidence = 78;

  const aqiIncreasing = aqiChange > 0;
  const tempIncreasing = tempChange > 0;

  const insightText =
    aqiIncreasing
      ? "Projected increase in particulate concentration indicates moderate AQI escalation within the selected time window."
      : "AQI levels are expected to remain stable under current environmental conditions.";

  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: 600 }} gutterBottom>
        AI Environmental Intelligence
      </Typography>

      {/* -------- TIME FILTER -------- */}
      <Stack direction="row" spacing={2} sx={{ marginBottom: 4 }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(e, value) => value && setTimeRange(value)}
        >
          <ToggleButton value="3H">3 Hours</ToggleButton>
          <ToggleButton value="6H">6 Hours</ToggleButton>
          <ToggleButton value="12H">12 Hours</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* -------- SUMMARY ROW -------- */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {/* AQI Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              padding: 3,
              borderRadius: 3,
              borderTop: "4px solid #ff6f61",
            }}
          >
            <Typography variant="body2">
              AQI Projection ({timeRange})
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {Math.round(predictedAQI)}
              </Typography>

              {aqiIncreasing ? (
                <ArrowUpwardIcon sx={{ color: "#e53935" }} />
              ) : (
                <ArrowDownwardIcon sx={{ color: "#43a047" }} />
              )}
            </Box>

            <Typography variant="body2">
              Change: {aqiChange.toFixed(1)}%
            </Typography>

            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Confidence: {aqiConfidence}%
            </Typography>

            <LinearProgress
              variant="determinate"
              value={aqiConfidence}
              sx={{ height: 6, borderRadius: 5, marginTop: 1 }}
            />
          </Paper>
        </Grid>

        {/* Temperature Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              padding: 3,
              borderRadius: 3,
              borderTop: "4px solid #e53935",
            }}
          >
            <Typography variant="body2">
              Temperature Projection ({timeRange})
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {predictedTemp.toFixed(1)}°C
              </Typography>

              {tempIncreasing ? (
                <ArrowUpwardIcon sx={{ color: "#e53935" }} />
              ) : (
                <ArrowDownwardIcon sx={{ color: "#43a047" }} />
              )}
            </Box>

            <Typography variant="body2">
              Change: +{tempChange.toFixed(1)}°C
            </Typography>

            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Confidence: {tempConfidence}%
            </Typography>

            <LinearProgress
              variant="determinate"
              value={tempConfidence}
              sx={{ height: 6, borderRadius: 5, marginTop: 1 }}
              color="error"
            />
          </Paper>
        </Grid>
      </Grid>

      {/* -------- AQI GRAPH -------- */}
      <Paper sx={{ padding: 3, borderRadius: 3, marginBottom: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          AQI Forecast
        </Typography>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis domain={[0, 500]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#ff6f61"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body2">Severity Level</Typography>
          <LinearProgress
            variant="determinate"
            value={(predictedAQI / 500) * 100}
            sx={{ height: 8, borderRadius: 5, marginTop: 1 }}
          />
        </Box>
      </Paper>

      {/* -------- TEMPERATURE GRAPH -------- */}
      <Paper sx={{ padding: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Heatwave Risk Projection
        </Typography>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis domain={[0, 60]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#e53935"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body2">Heat Intensity Index</Typography>
          <LinearProgress
            variant="determinate"
            value={(predictedTemp / 60) * 100}
            sx={{ height: 8, borderRadius: 5, marginTop: 1 }}
            color="error"
          />
        </Box>
      </Paper>

      {/* -------- EXPLAINABLE INSIGHT -------- */}
      <Paper
        sx={{
          padding: 3,
          borderRadius: 3,
          marginTop: 4,
          borderLeft: "4px solid #3949ab",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Predictive Insight
        </Typography>

        <Typography variant="body2" sx={{ marginTop: 2 }}>
          {insightText}
        </Typography>

        <Typography variant="body2" sx={{ marginTop: 1 }}>
          Temperature trend indicates potential heat stress conditions
          if upward trajectory continues within selected forecast window.
        </Typography>
      </Paper>
    </>
  );
}