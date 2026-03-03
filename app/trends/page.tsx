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

  /* -------- Y AXIS START FROM 0 -------- */
  const getDynamicDomain = (param: string) => {
    const values = data.map((d) => d[param]).filter((v) => v !== undefined);
    if (!values.length) return [0, 10];
    const max = Math.max(...values);
    const padding = max * 0.1 || 1;
    return [0, max + padding];
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
        <Paper sx={{ padding: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {data.fullTime}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
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
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          AQI Trend Analysis
        </Typography>
      </Box>

      <Stack direction="row" spacing={3} sx={{ marginBottom: 3, marginTop: 2 }}>
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

      <Fade in timeout={400} key={fadeKey}>
        <Paper sx={{ padding: 3, borderRadius: 3, marginBottom: 5 }}>
          <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <ResponsiveContainer width="98%" height={350}>
              <LineChart
                data={aqiData}
                margin={{ top: 20, right: 60, left: 80, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis
                  domain={getDynamicAQIDomain()}
                  tickFormatter={(v) => Number(v).toFixed(3)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="aqi"
                  stroke={colors.aqi}
                  strokeWidth={4}
                  dot={false}
                />
                <Brush dataKey="time" height={30} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Fade>

      <Divider sx={{ marginBottom: 5 }} />

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
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <ResponsiveContainer width="98%" height={450}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 80, left: 100, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />

              <YAxis
                yAxisId="left"
                domain={getDynamicDomain(leftParam)}
                stroke={colors[leftParam]}
                tickFormatter={(v) => Number(v).toFixed(3)}
              />

              {rightParam && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={getDynamicDomain(rightParam)}
                  stroke={colors[rightParam]}
                  tickFormatter={(v) => Number(v).toFixed(3)}
                />
              )}

              <Tooltip content={<CustomTooltip />} />
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
        </Box>
      </Paper>
    </>
  );
}