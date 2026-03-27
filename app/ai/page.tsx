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

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

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

      if (data.error) {
        setIsActive(false);
        return;
      }

      if (data?.current?.aqi != null && data?.current?.temperature != null) {
        setCurrentAQI(data.current.aqi);
        setCurrentTemp(data.current.temperature);
        setAqiConfidence(data.summary.aqi_confidence);
        setTempConfidence(data.summary.temp_confidence);

        const formatted = data.forecast.map((item: any) => ({
          hour: item.hour,
          aqi: item.aqi,
          temp: item.temperature,
        }));

        setForecastData(formatted);

        setLastUpdated(new Date().toLocaleTimeString());
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("API Error:", err);
        setIsActive(false);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // 🔥 FIX: instant fetch on toggle
  useEffect(() => {
    lastFetchRef.current = 0;
    fetchData(true);
  }, [timeRange]);

  // 🔥 Reduced polling (quota safe)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData();
      }
    }, 120000); // 2 min

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        fetchData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

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
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          AI Environmental Intelligence
        </Typography>

        <Box textAlign="right">
          <Typography variant="body2" sx={{ color: isActive ? "green" : "red" }}>
            ● {isActive ? "Live" : "Inactive"}
          </Typography>
          <Typography variant="caption">
            Updated: {lastUpdated || "--"}
          </Typography>
        </Box>
      </Box>

      {/* TIME FILTER */}
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

        {/* 🔥 Loading Indicator */}
        {loading && <CircularProgress size={24} />}
      </Stack>

      {/* SUMMARY */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ padding: 3, borderRadius: 3, borderTop: "4px solid #ff6f61" }}>
            <Typography variant="body2">AQI Projection ({timeRange})</Typography>

            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {predictedAQI !== "--" ? Math.round(Number(predictedAQI)) : "--"}
            </Typography>

            <Typography variant="body2">
              Change: {aqiChange.toFixed(1)}%
            </Typography>

            <Typography variant="body2">
              Confidence: {aqiConfidence}%
            </Typography>

            <LinearProgress value={aqiConfidence} variant="determinate" />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ padding: 3, borderRadius: 3 }}>
            <Typography variant="body2">
              Temperature Projection ({timeRange})
            </Typography>

            {/* 🔥 BOLD TEMP */}
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
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

            <LinearProgress value={tempConfidence} variant="determinate" />
          </Paper>
        </Grid>
      </Grid>

      {/* AQI GRAPH */}
      <Paper sx={{ padding: 3, borderRadius: 3, marginBottom: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          AQI Forecast
        </Typography>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={forecastData} key={timeRange}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis domain={[0, 500]} />
            <Tooltip />
            <Line type="monotone" dataKey="aqi" stroke="#ff6f61" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* TEMP GRAPH */}
      <Paper sx={{ padding: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Heatwave Risk Projection
        </Typography>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={forecastData} key={timeRange + "temp"}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis domain={[0, 60]} />
            <Tooltip />
            <Line type="monotone" dataKey="temp" stroke="#e53935" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </>
  );
}