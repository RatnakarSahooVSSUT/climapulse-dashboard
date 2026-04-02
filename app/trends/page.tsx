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
  Fade,
} from "@mui/material";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTheme } from "@mui/material/styles";

/* -------- Colors -------- */
const colors: any = {
  pm25: "#ff6f61",
  pm10: "#ff9800",
  co2: "#00acc1",
  co: "#8e24aa",
  ch4: "#43a047",
  no2: "#e53935",
  temperature: "#3949ab",
  humidity: "#26a69a",
  pressure: "#6d4c41",
  aqi: "#1976d2",
};

export default function TrendsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [timeRange, setTimeRange] = useState("1H");
  const [aqiRange, setAqiRange] = useState("1H");
  const [overlayMode, setOverlayMode] = useState(false);
  const [selectedParams, setSelectedParams] = useState<string[]>(["pm25"]);
  const [data, setData] = useState<any[]>([]);
  const [aqiData, setAqiData] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);

  const getMinutes = (range: string) => {
    if (range === "30M") return 30;
    if (range === "1H") return 60;
    if (range === "6H") return 360;
    if (range === "24H") return 1440;
    return 60;
  };

  useEffect(() => {
    const q = query(
      collection(db, "sensor_data"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIsLive(true);

      const now = new Date();
      const mainCutoff = new Date(
        now.getTime() - getMinutes(timeRange) * 60000
      );
      const aqiCutoff = new Date(
        now.getTime() - getMinutes(aqiRange) * 60000
      );

      const mainArray: any[] = [];
      const aqiArray: any[] = [];

      snapshot.forEach((doc) => {
        const d = doc.data();
        const time = d.timestamp?.toDate();
        if (!time) return;

        const formatted = {
          time: time.toLocaleTimeString(),
          fullTime: time.toLocaleString(),
          pm25: Number(d.pm25?.toFixed(3)),
          pm10: Number(d.pm10?.toFixed(3)),
          co2: Number(d.co2?.toFixed(3)),
          co: Number(d.co?.toFixed(3)),
          ch4: Number(d.ch4?.toFixed(3)),
          no2: Number(d.no2?.toFixed(3)),
          temperature: Number(d.temperature?.toFixed(3)),
          humidity: Number(d.humidity?.toFixed(3)),
          pressure: Number(d.pressure?.toFixed(3)),
          aqi: Number(d.aqi?.toFixed(3)),
        };

        if (time >= mainCutoff) mainArray.push(formatted);
        if (time >= aqiCutoff) aqiArray.push(formatted);
      });

      setData(mainArray);
      setAqiData(aqiArray);
      setFadeKey((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, [timeRange, aqiRange]);

  const getDynamicDomain = (param: string) => {
  const values = data.map((d) => d[param]).filter((v) => v !== undefined);

  if (!values.length) return [0, 10];

  const min = Math.min(...values);
  const max = Math.max(...values);

  // 🔥 Step 1: Add padding
  const range = max - min || 1;
  const padding = range * 0.15;

  let newMin = min - padding;
  let newMax = max + padding;

  // 🔥 Step 2: Round to clean numbers
  const roundFactor = Math.pow(10, Math.floor(Math.log10(newMax)));

  newMax = Math.ceil(newMax / roundFactor) * roundFactor;
  newMin = Math.floor(newMin / roundFactor) * roundFactor;

  return [newMin, newMax];
};

  const getDynamicAQIDomain = () => {
    const values = aqiData.map((d) => d.aqi);
    if (!values.length) return [0, 100];
    const max = Math.max(...values);
    const padding = max * 0.1 || 5;
    return [0, max + padding];
  };

  const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper
        sx={{
          p: 1.5,
          borderRadius: 2,
          backdropFilter: "blur(8px)",

          background: isDark
            ? "rgba(15,23,42,0.85)"
            : "#ffffff",

          color: isDark ? "#e2e8f0" : "#111827",

          border: isDark
            ? "1px solid #334155"
            : "1px solid #e5e7eb",

          boxShadow: isDark
            ? "0 0 10px rgba(0,0,0,0.6)"
            : "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {data.fullTime}
        </Typography>

        {payload.map((entry: any, index: number) => (
          <Typography key={index} sx={{ color: entry.color }}>
            {entry.name.toUpperCase()} : {entry.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

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
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        AQI Trend Analysis
      </Typography>

      {/* AQI RANGE */}
      <Stack direction="row" spacing={3} sx={{ mb: 3, mt: 2 }}>
        <ToggleButtonGroup
          value={aqiRange}
          exclusive
          onChange={(e, value) => value && setAqiRange(value)}
          sx={{
            backdropFilter: "blur(12px)",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(15,23,42,0.6)"
                : "rgba(255,255,255,0.95)",
            borderRadius: 3,
            p: "4px",
            border: "1px solid #6366f1",
            boxShadow: "0 0 15px rgba(99,102,241,0.3)",
            "& .MuiToggleButton-root": {
              border: "none",
              color: "#6366f1",
              px: 3,
            },
            "& .Mui-selected": {
              color: "#00ff9c !important",
              boxShadow: "0 0 12px #00ff9c",
            },
          }}
        >
          <ToggleButton value="30M">30 Min</ToggleButton>
          <ToggleButton value="1H">1 Hour</ToggleButton>
          <ToggleButton value="6H">6 Hours</ToggleButton>
          <ToggleButton value="24H">24 Hours</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* AQI GRAPH */}
      <Fade in timeout={400} key={fadeKey}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            mb: 5,
            backdropFilter: "blur(18px)",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(15,23,42,0.6)"
                : "rgba(255,255,255,0.95)",
            border: "1px solid #1976d2",
            boxShadow: "0 0 25px rgba(25,118,210,0.4)",
          }}
        >
          <ResponsiveContainer width="98%" height={350}>
            <LineChart data={aqiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={getDynamicAQIDomain()} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                dataKey="aqi"
                stroke={colors.aqi}
                strokeWidth={3}
                dot={false}
              />
              <Brush dataKey="time" height={30} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Fade>

      <Divider sx={{ mb: 5 }} />

      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Parameter Trends
      </Typography>

      {/* PARAM CONTROLS */}
      <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(e, value) => value && setTimeRange(value)}
          sx={{
            backdropFilter: "blur(12px)",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(15,23,42,0.6)"
                : "rgba(255,255,255,0.9)",

            borderRadius: 3,
            p: "4px",
            border: "1px solid #6366f1",

            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 0 15px rgba(99,102,241,0.3)"
                : "0 4px 15px rgba(99,102,241,0.15)",

            "& .MuiToggleButton-root": {
              border: "none",
              color: "#6366f1",
              px: 3,
              transition: "0.2s",
            },

            "& .Mui-selected": {
              color: (theme) =>
                theme.palette.mode === "dark" ? "#00ff9c" : "#2563eb",

              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(0,255,156,0.1)"
                  : "rgba(37,99,235,0.1)",

              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 0 12px #00ff9c"
                  : "0 0 8px rgba(37,99,235,0.4)",
            },
          }}
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

      {/* PARAM SELECT */}
      <ToggleButtonGroup
        value={overlayMode ? selectedParams : selectedParams[0]}
        exclusive={!overlayMode}
        onChange={handleParamSelect}
        sx={{ flexWrap: "wrap", mb: 3 }}
      >
        {Object.keys(colors)
          .filter((k) => k !== "aqi")
          .map((key) => (
            <ToggleButton
              key={key}
              value={key}
              sx={{
                color: colors[key],
                border: `1px solid ${colors[key]}`,
                borderRadius: 2,
                transition: "0.25s",

                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(255,255,255,0.8)",

                "&:hover": {
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? `0 0 12px ${colors[key]}`
                      : `0 0 8px ${colors[key]}40`,
                    transform: "scale(1.04)",
                },

                "&.Mui-selected": {
                  color: "#ffffff", // ✅ always white text

                  background: `${colors[key]}CC`, // 🔥 stronger background (better contrast)

                  fontWeight: 600,

                  boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? `0 0 12px ${colors[key]}`
                    : `0 0 8px ${colors[key]}40`,
                }
              }}
            >
              {key.toUpperCase()}
            </ToggleButton>
          ))}
      </ToggleButtonGroup>

      {/* PARAM GRAPH */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          backdropFilter: "blur(18px)",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(15,23,42,0.6)"
              : "rgba(255,255,255,0.95)",
          border: `1px solid ${colors[leftParam]}`,
          boxShadow: `0 0 25px ${colors[leftParam]}40`,
        }}
      >
        <ResponsiveContainer width="98%" height={450}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              yAxisId="left"
              domain={getDynamicDomain(leftParam)}
              allowDataOverflow={false}
              tickCount={6}
            />
            {rightParam && <YAxis yAxisId="right" orientation="right" />}
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Line
              yAxisId="left"
              dataKey={leftParam}
              stroke={colors[leftParam]}
              strokeWidth={3}
              dot={false}
            />

            {rightParam && (
              <Line
                yAxisId="right"
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