"use client";

import {
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ---------------- Colors ---------------- */
const paramColors: Record<string, string> = {
  AQI: "#ff6f61",
  "PM2.5": "#f39c12",
  PM10: "#8e44ad",
  CO2: "#3498db",
  CO: "#16a085",
  CH4: "#e74c3c",
  NO2: "#2c3e50",
  Temperature: "#e67e22",
  Humidity: "#27ae60",
  Pressure: "#34495e",
};

/* ---------------- Units ---------------- */
const paramUnits: Record<string, string> = {
  AQI: "Index",
  "PM2.5": "µg/m³",
  PM10: "µg/m³",
  CO2: "ppm",
  CO: "ppm",
  CH4: "ppm",
  NO2: "ppm",
  Temperature: "°C",
  Humidity: "%",
  Pressure: "hPa",
};

/* ---------------- Executive Summary ---------------- */
const narrative = `This Environmental Monitoring Report provides a consolidated technical evaluation of atmospheric and air quality parameters recorded during the selected monitoring interval. The analysis includes statistical characterization (minimum, average, and maximum values), temporal trend visualization, and parameter-specific interpretation to assess environmental stability, pollutant variability, and atmospheric behavior patterns. The report supports performance evaluation, compliance review, operational oversight, and structured environmental assessment.`;

/* ---------------- Interpretations ---------------- */
const interpretations: Record<string, string> = {
  AQI:
    "The Air Quality Index (AQI) represents a composite atmospheric pollution indicator derived from multiple pollutant concentrations. Lower index values correspond to improved air quality, while elevated values reflect increased environmental stress levels.",
  "PM2.5":
    "PM2.5 denotes fine particulate matter capable of remaining suspended in the atmosphere. Elevated concentrations may influence atmospheric clarity and respiratory exposure dynamics.",
  PM10:
    "PM10 represents coarse particulate matter associated with dust, mechanical emissions, and atmospheric dispersion variability.",
  CO2:
    "Carbon dioxide (CO₂) concentration reflects atmospheric gas balance and ventilation efficiency within the monitored environment.",
  CO:
    "Carbon monoxide (CO) concentration indicates combustion-related emissions. Variations may reflect changes in emission intensity or localized sources.",
  CH4:
    "Methane (CH₄) levels represent trace hydrocarbon presence and may indicate biogenic or industrial emission activity.",
  NO2:
    "Nitrogen dioxide (NO₂) levels are associated with combustion processes and vehicular emissions, reflecting atmospheric dispersion patterns.",
  Temperature:
    "Ambient temperature reflects thermal environmental conditions and short-term climatic behavior across the monitoring interval.",
  Humidity:
    "Relative humidity represents atmospheric moisture content and influences environmental stability and thermal perception.",
  Pressure:
    "Atmospheric pressure indicates air mass movement and meteorological transitions affecting environmental conditions.",
};

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("1H");
  const [selectedParams, setSelectedParams] = useState<string[]>(["AQI"]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const getMinutes = (range: string) => {
    if (range === "30M") return 30;
    if (range === "1H") return 60;
    if (range === "6H") return 360;
    if (range === "24H") return 1440;
    return 60;
  };

  const fetchData = async () => {
    const q = query(
      collection(db, "sensor_data"),
      orderBy("timestamp", "asc")
    );

    const snapshot = await getDocs(q);

    const now = new Date();
    const cutoff = new Date(
      now.getTime() - getMinutes(timeRange) * 60000
    );

    const filtered: any[] = [];

    snapshot.forEach((doc) => {
      const d = doc.data();
      const time = d.timestamp?.toDate();
      if (!time || time < cutoff) return;

      filtered.push({
        timeLabel: time.toLocaleString(),
        AQI: Number(d.aqi?.toFixed(3)),
        "PM2.5": Number(d.pm25?.toFixed(3)),
        PM10: Number(d.pm10?.toFixed(3)),
        CO2: Number(d.co2?.toFixed(3)),
        CO: Number(d.co?.toFixed(3)),
        CH4: Number(d.ch4?.toFixed(3)),
        NO2: Number(d.no2?.toFixed(3)),
        Temperature: Number(d.temperature?.toFixed(3)),
        Humidity: Number(d.humidity?.toFixed(3)),
        Pressure: Number(d.pressure?.toFixed(3)),
      });
    });

    setData(filtered);
    setReportGenerated(true);
  };

  const computeStats = (values: number[]) => {
    const n = values.length;
    const avg = values.reduce((a, b) => a + b, 0) / n;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const variance =
      values.reduce((sum, val) => sum + (val - avg) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);

    return { min, avg, max, stdDev, samples: n };
  };

  const downloadCSV = () => {
  if (!data.length) return;

  const headers = ["Timestamp", ...selectedParams];

  const rows = data.map((row) => [
    `"${new Date(row.timeLabel).toISOString()}"`,
    ...selectedParams.map((param) => `"${row[param]}"`),
  ]);

  const csvContent =
    "\uFEFF" + // UTF-8 BOM for Excel
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ClimaPulse_Environmental_Report.csv";
  link.click();
};

  const downloadPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    let yPosition = 20;
    let pageNumber = 1;

    const addHeader = () => {
      pdf.setFontSize(15);
      pdf.text("ClimaPulse Environmental Monitoring Report", margin, 10);
      pdf.setFontSize(9);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, 15);
      pdf.setFontSize(9);
      pdf.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 5, {
        align: "right",
      });

      pdf.setTextColor(230);
      pdf.setFontSize(60);
      pdf.text("ClimaPulse", pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: 45,
      });
      pdf.setTextColor(0);
    };

    addHeader();
    yPosition += 10;

    pdf.setFontSize(13);
    pdf.text("Executive Summary", margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    const summaryLines = pdf.splitTextToSize(narrative, contentWidth);
    pdf.text(summaryLines, margin, yPosition, {
      maxWidth: contentWidth,
      align: "justify",
    });
    yPosition += summaryLines.length * 5 + 10;

    for (const param of selectedParams) {
      const element = document.getElementById(`report-${param}`);
      if (!element) continue;

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      if (yPosition + imgHeight > pageHeight - 15) {
        pdf.addPage();
        pageNumber++;
        addHeader();
        yPosition = 20;
      }

      pdf.addImage(imgData, "PNG", margin, yPosition, contentWidth, imgHeight);
      yPosition += imgHeight + 10;
    }

    pdf.save("ClimaPulse_Environmental_Report.pdf");
  };

  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: 600 }} gutterBottom>
        ClimaPulse Environmental Report System
      </Typography>

      {/* Time Range - Styled */}
      <Paper sx={{ padding: 3, borderRadius: 2, marginBottom: 3 }}>
        <Typography variant="h6">Time Range</Typography>
        <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(e, value) => value && setTimeRange(value)}
            sx={{
              "& .MuiToggleButton-root": {
                borderColor: "#1976d2",
                color: "#1976d2",
                fontWeight: 500,
              },
              "& .Mui-selected": {
                backgroundColor: "#1976d2 !important",
                color: "#fff !important",
              },
            }}
          >
            <ToggleButton value="30M">30 Min</ToggleButton>
            <ToggleButton value="1H">1 Hour</ToggleButton>
            <ToggleButton value="6H">6 Hours</ToggleButton>
            <ToggleButton value="24H">24 Hours</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {/* Parameter Selection - Colored */}
      <Paper sx={{ padding: 3, borderRadius: 2, marginBottom: 3 }}>
        <Typography variant="h6">Select Parameters</Typography>
        <FormGroup sx={{ marginTop: 2 }}>
          <Grid container spacing={2}>
            {Object.keys(paramColors).map((param) => (
              <Grid key={param} size={{ xs: 6, md: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedParams.includes(param)}
                      sx={{
                        color: paramColors[param],
                        "&.Mui-checked": {
                          color: paramColors[param],
                        },
                      }}
                      onChange={() =>
                        setSelectedParams((prev) =>
                          prev.includes(param)
                            ? prev.filter((p) => p !== param)
                            : [...prev, param]
                        )
                      }
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        color: paramColors[param],
                        fontWeight: 500,
                      }}
                    >
                      {param}
                    </Typography>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </Paper>

      <Button variant="contained" sx={{ mb: 3 }} onClick={fetchData}>
        Generate Report
      </Button>

      {reportGenerated &&
        selectedParams.map((param) => {
          const values = data.map((d) => d[param]);
          const stats = computeStats(values);

          return (
            <Paper
              key={param}
              id={`report-${param}`}
              sx={{ padding: 3, borderRadius: 2, marginBottom: 4 }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: paramColors[param] }}
              >
                {param} ({paramUnits[param]})
              </Typography>

              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Samples</TableCell>
                    <TableCell>{stats.samples}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Minimum</TableCell>
                    <TableCell>{stats.min.toFixed(3)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Average</TableCell>
                    <TableCell>{stats.avg.toFixed(3)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Maximum</TableCell>
                    <TableCell>{stats.max.toFixed(3)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Standard Deviation</TableCell>
                    <TableCell>{stats.stdDev.toFixed(3)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeLabel" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      border: "1px solid #ccc",
                    }}
                    labelStyle={{ color: "#000000" }}
                    itemStyle={{ color: "#000000" }}
                  />
                  <Line
                    type="monotone"
                    dataKey={param}
                    stroke={paramColors[param]}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>

              <Box
                sx={{
                  marginTop: 2,
                  padding: 2,
                  backgroundColor: "#ffffff",
                  borderLeft: `3px solid ${paramColors[param]}`,
                  borderRadius: 1.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ lineHeight: 1.7, color: "#000000" }}
                >
                  {interpretations[param]}
                </Typography>
              </Box>
            </Paper>
          );
        })}

      {reportGenerated && (
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadCSV}
          >
            Download CSV
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadPDF}
          >
            Download PDF
          </Button>
        </Stack>
      )}
    </>
  );
}