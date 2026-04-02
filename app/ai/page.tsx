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
  CircularProgress,
  useTheme,
} from "@mui/material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { useState, useEffect, useRef } from "react";

export default function AIPredictionPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [timeRange, setTimeRange] = useState("6H");
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [currentAQI, setCurrentAQI] = useState<number | null>(null);
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [aqiConfidence, setAqiConfidence] = useState(0);
  const [tempConfidence, setTempConfidence] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadingRef = useRef(false);
  const lastFetchRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchData = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 10000) return;
    lastFetchRef.current = now;

    if (loadingRef.current) return;
    loadingRef.current = true;

    setLoading(true);

    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    try {
      let hours = 6;
      if (timeRange === "3H") hours = 3;
      else if (timeRange === "12H") hours = 12;

      const res = await fetch(
        `https://climapulse-backend.onrender.com/predict?hours=${hours}`,
        { signal: controllerRef.current.signal }
      );

      const data = await res.json();

      if (data?.current?.aqi != null && data?.current?.temperature != null) {
        setCurrentAQI(data.current.aqi);
        setCurrentTemp(data.current.temperature);
        setAqiConfidence(data.summary.aqi_confidence);
        setTempConfidence(data.summary.temp_confidence);

        const formatted = data.forecast.map((item: any, i: number) => ({
          hour: i === 0 ? "0" : `+${i}`, // FIXED LABEL
          aqi: item.aqi,
          temp: item.temperature,
        }));

        formatted.push({
          hour: `+${timeRange === "3H" ? 3 : timeRange === "6H" ? 6 : 12}`,
          aqi: formatted[formatted.length - 1].aqi,
          temp: formatted[formatted.length - 1].temp,
        });

        setForecastData(formatted);
        setLastUpdated(new Date().toLocaleTimeString());
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    } catch {
      setIsActive(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    lastFetchRef.current = 0;
    fetchData(true);
  }, [timeRange]);

  const predictedAQI =
    forecastData.length > 0
      ? forecastData[forecastData.length - 1].aqi
      : currentAQI ?? "--";

  const predictedTemp =
    forecastData.length > 0
      ? forecastData[forecastData.length - 1].temp
      : currentTemp ?? "--";

  const aqiChange =
    currentAQI && predictedAQI !== "--"
      ? ((predictedAQI - currentAQI) / currentAQI) * 100
      : 0;

  const tempChange =
    currentTemp && predictedTemp !== "--"
      ? predictedTemp - currentTemp
      : 0;

  return (
    <>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        AI Environmental Intelligence
      </Typography>

      <Box textAlign="right">
        {/* LIVE INDICATOR */}
        <Typography
          sx={{
            color: isActive ? "#00ff9c" : "#ff4d4d",
            fontWeight: 600,
            textShadow: isActive
              ? "0 0 8px #00ff9c"
              : "0 0 8px #ff4d4d",
          }}
        >
          ● {isActive ? "Live" : "Inactive"}
        </Typography>

        {/* LAST UPDATED */}
        <Typography variant="caption">
          Updated: {lastUpdated || "--"}
        </Typography>
      </Box>
    </Box>

      {/* TIME FILTER */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(e, value) => value && setTimeRange(value)}
          sx={{
            "& .MuiToggleButton-root": {
              border: "1px solid #6366f1",
              color: "#6366f1",
              background: "transparent",
              borderRadius: 3,
              px: 3,
              "&:hover": {
                boxShadow: "0 0 10px #6366f1",
              },
            },
            "& .Mui-selected": {
              color: "#00ff9c !important",
              border: "1px solid #00ff9c",
              boxShadow: "0 0 12px #00ff9c",
            },
          }}
        >
          <ToggleButton value="3H">3H</ToggleButton>
          <ToggleButton value="6H">6H</ToggleButton>
          <ToggleButton value="12H">12H</ToggleButton>
        </ToggleButtonGroup>

        {loading && <CircularProgress size={22} />}
      </Stack>

      {/* 🔥 VALUE CARDS (RESTORED + IMPROVED) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: isDark
                ? "linear-gradient(145deg,#0f172a,#1e293b)"
                : "#ffffff",
              border: "1px solid #ff6f61",
              boxShadow: "0 0 12px #ff6f6140",
            }}
          >
            <Typography variant="body2">AQI Projection</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {predictedAQI !== "--"
                ? Math.round(Number(predictedAQI))
                : "--"}
            </Typography>

            <Typography variant="body2">
              Change: {aqiChange.toFixed(1)}%
            </Typography>

            <Typography variant="body2">
              Confidence: {aqiConfidence}%
            </Typography>

            <LinearProgress
              value={aqiConfidence}
              variant="determinate"
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: isDark
                ? "linear-gradient(145deg,#0f172a,#1e293b)"
                : "#ffffff",
              border: "1px solid #e53935",
              boxShadow: "0 0 12px #e5393540",
            }}
          >
            <Typography variant="body2">Temperature Projection</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {predictedTemp !== "--"
                ? `${Number(predictedTemp).toFixed(1)}°C`
                : "--"}
            </Typography>

            <Typography variant="body2">
              Change: {tempChange.toFixed(1)}°C
            </Typography>

            <Typography variant="body2">
              Confidence: {tempConfidence}%
            </Typography>

            <LinearProgress
              value={tempConfidence}
              variant="determinate"
              color="error"
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* 🔥 AQI CARD */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          border: "1px solid #00f5ff",
          boxShadow: "0 0 20px #00f5ff40",
        }}
      >
        <Typography variant="h6">AQI Forecast</Typography>
        <Box sx={{ px: 2 }}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={forecastData}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid stroke={isDark ? "#1f2937" : "#e5e7eb"} />
              <XAxis
                stroke={isDark ? "#aaa" : "#555"}
                dataKey="hour"
                interval={0}
              />
              <YAxis stroke={isDark ? "#aaa" : "#555"} />
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
        </Box>

        {/* Severity */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">Severity Level</Typography>
          <LinearProgress
            variant="determinate"
            value={
              predictedAQI <= 50
                ? 20
                : predictedAQI <= 100
                ? 40
                : predictedAQI <= 200
                ? 60
                : predictedAQI <= 300
                ? 80
                : 100
            }
            sx={{ mt: 1, height: 8, borderRadius: 5 }}
          />
        </Box>
      </Paper>

      {/* 🔥 TEMP CARD */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          border: "1px solid #ff4d6d",
          boxShadow: "0 0 20px #ff4d6d40",
        }}
      >
        <Typography variant="h6">Heatwave Risk Projection</Typography>
        <Box sx={{ px: 2 }}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={forecastData}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid stroke={isDark ? "#1f2937" : "#e5e7eb"} />
              <XAxis stroke={isDark ? "#aaa" : "#555"} dataKey="hour" />
              <YAxis stroke={isDark ? "#aaa" : "#555"} />
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
        </Box>

        {/* Intensity */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">Heat Intensity Index</Typography>
          <LinearProgress
            variant="determinate"
            value={
              predictedTemp <= 25
                ? 20
                : predictedTemp <= 30
                ? 40
                : predictedTemp <= 35
                ? 60
                : predictedTemp <= 40
                ? 80
                : 100
            }
            sx={{ mt: 1, height: 8, borderRadius: 5 }}
            color="error"
          />
        </Box>
      </Paper>
    </>
  );
}