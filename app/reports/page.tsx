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
  Divider,
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
  Label,
} from "recharts";

import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

/* ---------------- Dummy Timeline Generator ---------------- */
const generateDummyData = (
  points: number,
  intervalMinutes: number,
  includeDate: boolean
) => {
  const now = new Date();
  const data = [];

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(
      now.getTime() - i * intervalMinutes * 60000
    );

    data.push({
      isoTimestamp: timestamp.toISOString(),
      timeLabel: includeDate
        ? timestamp.toLocaleString()
        : timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      AQI: 80 + Math.random() * 60,
      "PM2.5": 20 + Math.random() * 40,
      PM10: 40 + Math.random() * 60,
      CO2: 400 + Math.random() * 100,
      CO: 1 + Math.random(),
      CH4: 2 + Math.random(),
      NO2: 10 + Math.random() * 15,
      Temperature: 28 + Math.random() * 8,
      Humidity: 50 + Math.random() * 30,
      Pressure: 1000 + Math.random() * 20,
    });
  }

  return data;
};

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("1H");
  const [selectedParams, setSelectedParams] = useState<string[]>(["AQI"]);
  const [reportGenerated, setReportGenerated] = useState(false);

  /* ---------------- Time Logic ---------------- */
  let points = 10;
  let interval = 10;
  let includeDate = false;

  if (timeRange === "30M") {
    points = 6;
    interval = 5;
  } else if (timeRange === "6H") {
    points = 12;
    interval = 30;
  } else if (timeRange === "24H") {
    points = 24;
    interval = 60;
    includeDate = true;
  }

  const data = generateDummyData(points, interval, includeDate);

  const handleParamToggle = (param: string) => {
    setSelectedParams((prev) =>
      prev.includes(param)
        ? prev.filter((p) => p !== param)
        : [...prev, param]
    );
  };

  const narrative = `This Environmental Monitoring Report provides a consolidated technical evaluation of atmospheric and air quality parameters recorded during the selected monitoring interval. The analysis includes statistical characterization (minimum, average, and maximum values), temporal trend visualization, and parameter-specific interpretation to assess environmental stability, pollutant variability, and atmospheric behavior patterns. The report supports performance evaluation, compliance review, operational oversight, and structured environmental assessment.`;

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
  /* ---------------- Professional PDF Generator ---------------- */
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
      pdf.text(
        `Generated: ${new Date().toLocaleString()}`,
        margin,
        15
      );

      pdf.setFontSize(9);
      pdf.text(
        `Page ${pageNumber}`,
        pageWidth - margin,
        pageHeight - 5,
        { align: "right" }
      );

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

    const summaryLines = pdf.splitTextToSize(
        narrative,
        contentWidth
    );

    pdf.text(summaryLines, margin, yPosition, {
        maxWidth: contentWidth,
        align: "justify",
    });
    yPosition += summaryLines.length * 5 + 10;

    /* Render each parameter block individually */
    for (const param of selectedParams) {
      const element = document.getElementById(`report-${param}`);
      if (!element) continue;

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const imgHeight =
        (canvas.height * contentWidth) / canvas.width;

      if (yPosition + imgHeight > pageHeight - 15) {
        pdf.addPage();
        pageNumber++;
        addHeader();
        yPosition = 20;
      }

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        yPosition,
        contentWidth,
        imgHeight
      );

      yPosition += imgHeight + 10;
    }

    pdf.save("ClimaPulse_Environmental_Report.pdf");
  };

  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: 600 }} gutterBottom>
        ClimaPulse Environmental Report System
      </Typography>

      <Paper sx={{ padding: 3, borderRadius: 2, marginBottom: 3 }}>
        <Typography variant="h6">Time Range</Typography>
        <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
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
        </Stack>
      </Paper>

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
                      onChange={() => handleParamToggle(param)}
                    />
                  }
                  label={param}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </Paper>

      <Button
        variant="contained"
        sx={{ marginBottom: 3 }}
        onClick={() => setReportGenerated(true)}
      >
        Generate Report
      </Button>

      {reportGenerated &&
        selectedParams.map((param) => {
          const values = data.map((d: any) => d[param]);
          const avg =
            values.reduce((a: number, b: number) => a + b, 0) /
            values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);

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
                    <TableCell>Minimum</TableCell>
                    <TableCell>
                      {min.toFixed(2)} {paramUnits[param]}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Average</TableCell>
                    <TableCell>
                      {avg.toFixed(2)} {paramUnits[param]}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Maximum</TableCell>
                    <TableCell>
                      {max.toFixed(2)} {paramUnits[param]}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeLabel">
                    <Label value="Time" position="insideBottom" />
                  </XAxis>
                  <YAxis>
                    <Label
                      value={paramUnits[param]}
                      angle={-90}
                      position="insideLeft"
                    />
                  </YAxis>
                  <Tooltip />
          
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
                  backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#ffffff" : "#f6f9ff",
                  borderLeft: `3px solid ${paramColors[param]}`,
                  borderRadius: 1.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    lineHeight: 1.7,
                    color: "#000000",
                  }}
                >
                  {interpretations[param]}
                </Typography>
              </Box>
            </Paper>
          );
        })}

      {reportGenerated && (
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadPDF}
        >
          Download PDF
        </Button>
      )}
    </>
  );
}