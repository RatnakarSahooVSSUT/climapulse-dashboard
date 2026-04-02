"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  useTheme,
  Divider,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";

import {
  Air,
  Grain,
  DeviceThermostat,
  Opacity,
  Speed,
} from "@mui/icons-material";

import { useState } from "react";

const MotionCard = motion(Card);

// 🎨 Neon Colors
const getColor = (name: string) => {
  switch (name) {
    case "AQI": return "#00f5ff";
    case "PM2.5": return "#ff9f1c";
    case "PM10": return "#ff6b00";
    case "CO2": return "#00ff9c";
    case "CO": return "#ff3b3b";
    case "NO2": return "#a855f7";
    case "CH4": return "#eab308";
    case "Temperature": return "#ff4d6d";
    case "Humidity": return "#00d4ff";
    case "Pressure": return "#6366f1";
    default: return "#3b82f6";
  }
};

const sections = [
  {
    title: "Air Quality Core",
    items: [
      {
        name: "AQI",
        icon: <Air />,
        desc: "Overall air quality score",
        details: {
          intro:
            "AQI (Air Quality Index) is a number used to represent how clean or polluted the air is.",
          importance:
            "It simplifies multiple pollutant readings into one value for easy understanding.",
          sources:
            "Calculated using pollutants like PM2.5, PM10, NO2, CO.",
          safe:
            "0–50 Good | 51–100 Moderate | 101–200 Poor | 201–300 Very Poor | 300+ Severe",
          effects:
            "High AQI can cause breathing difficulty, eye irritation, and long-term health damage.",
          tips:
            "Limit outdoor activities when AQI is high. Use masks and stay indoors.",
        },
      },
      {
        name: "PM2.5",
        icon: <Grain />,
        desc: "Very fine particles",
        details: {
          intro:
            "PM2.5 refers to tiny particles smaller than 2.5 micrometers.",
          importance:
            "These particles can enter deep into lungs and bloodstream.",
          sources:
            "Vehicle emissions, burning fuels, industrial pollution, cooking smoke.",
          safe: "Safe level: below 60 µg/m³ (India standard)",
          effects:
            "Can cause asthma, lung disease, heart problems.",
          tips:
            "Wear masks, use air purifiers, avoid polluted roads.",
        },
      },
      {
        name: "PM10",
        icon: <Grain />,
        desc: "Coarse dust particles",
        details: {
          intro:
            "PM10 includes larger airborne particles like dust and pollen.",
          importance:
            "These particles affect breathing and visibility.",
          sources:
            "Construction, road dust, wind-blown soil, industries.",
          safe: "Safe level: below 100 µg/m³",
          effects:
            "Causes throat irritation, coughing, allergies.",
          tips:
            "Avoid dusty areas and wear protective masks.",
        },
      },
    ],
  },

  {
    title: "Harmful Gases",
    items: [
      {
        name: "CO2",
        icon: <Air />,
        desc: "Indoor air quality indicator",
        details: {
          intro:
            "CO2 (carbon dioxide) is naturally present in air but increases indoors.",
          importance:
            "High CO2 levels indicate poor ventilation.",
          sources:
            "Human breathing, closed rooms, poor airflow.",
          safe: "Safe level: below 1000 ppm",
          effects:
            "Causes drowsiness, headache, lack of concentration.",
          tips:
            "Open windows, improve airflow, use ventilation systems.",
        },
      },
      {
        name: "CO",
        icon: <Air />,
        desc: "Toxic gas",
        details: {
          intro:
            "Carbon monoxide is a dangerous gas with no color or smell.",
          importance:
            "Even small amounts can be life-threatening.",
          sources:
            "Vehicle exhaust, gas stoves, generators, incomplete burning.",
          safe: "Safe level: below 2 ppm",
          effects:
            "Dizziness, confusion, unconsciousness, even death.",
          tips:
            "Ensure proper ventilation and avoid enclosed burning.",
        },
      },
      {
        name: "NO2",
        icon: <Air />,
        desc: "Traffic-related gas",
        details: {
          intro:
            "Nitrogen dioxide is produced mainly from fuel combustion.",
          importance:
            "Indicator of urban pollution levels.",
          sources:
            "Vehicles, industries, power plants.",
          safe: "Safe level: below 80 µg/m³",
          effects:
            "Lung irritation, breathing problems.",
          tips:
            "Avoid traffic-heavy areas and polluted zones.",
        },
      },
      {
        name: "CH4",
        icon: <Air />,
        desc: "Methane gas",
        details: {
          intro:
            "Methane is a flammable gas released from organic waste.",
          importance:
            "Important for environmental and safety monitoring.",
          sources:
            "Landfills, agriculture, sewage, gas leaks.",
          safe:
            "Should be kept minimal (no direct daily limit for exposure).",
          effects:
            "High levels may cause oxygen displacement and suffocation.",
          tips:
            "Ensure ventilation and monitor gas leaks.",
        },
      },
    ],
  },

  {
    title: "Environmental Conditions",
    items: [
      {
        name: "Temperature",
        icon: <DeviceThermostat />,
        desc: "Ambient temperature",
        details: {
          intro:
            "Temperature measures how hot or cold the environment is.",
          importance:
            "Affects comfort and how pollutants behave in air.",
          sources:
            "Weather conditions, sunlight, surroundings.",
          safe: "Comfort range: 20–30°C",
          effects:
            "High temperature can cause dehydration and heat stress.",
          tips:
            "Stay hydrated and avoid extreme heat exposure.",
        },
      },
      {
        name: "Humidity",
        icon: <Opacity />,
        desc: "Moisture level",
        details: {
          intro:
            "Humidity measures the amount of water vapor in the air.",
          importance:
            "Affects breathing comfort and indoor air quality.",
          sources:
            "Weather, indoor activities like cooking and bathing.",
          safe: "Ideal range: 40–60%",
          effects:
            "High humidity causes discomfort and mold growth.",
          tips:
            "Maintain ventilation and control indoor moisture.",
        },
      },
      {
        name: "Pressure",
        icon: <Speed />,
        desc: "Atmospheric pressure",
        details: {
          intro:
            "Pressure is the weight of air in the atmosphere.",
          importance:
            "Affects weather changes and pollutant movement.",
          sources:
            "Natural atmospheric conditions.",
          safe: "Normal: around 1013 hPa",
          effects:
            "Sudden changes may cause mild headaches.",
          tips:
            "Monitor trends to understand weather patterns.",
        },
      },
    ],
  },
];

export default function Page() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const theme = useTheme();

  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Pollutant Insights
      </Typography>

      {sections.map((section, idx) => (
        <Box key={idx} sx={{ mb: 5 }}>
          <Typography variant="h6" sx={{ mb: 2, opacity: 0.8 }}>
            {section.title}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 3,
            }}
          >
            {section.items.map((item, i) => {
              const color = getColor(item.name);

              return (
                <MotionCard
                  key={i}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => {
                    setSelected(item);
                    setOpen(true);
                  }}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 3,
                    background: isDark
                      ? "linear-gradient(145deg, #0f172a, #1e293b)"
                      : "linear-gradient(145deg, #ffffff, #f8fafc)",
                    border: `1px solid ${color}55`,
                    boxShadow: isDark
                      ? `0 0 10px ${color}22`
                      : `0 5px 15px ${color}22`,
                    "&:hover": {
                      boxShadow: `0 0 20px ${color}66`,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2, color }}>
                      {item.icon}
                    </Box>

                    <Typography variant="h6">{item.name}</Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: isDark ? "#cbd5e1" : "#475569",
                      }}
                    >
                      {item.desc}
                    </Typography>
                  </CardContent>
                </MotionCard>
              );
            })}
          </Box>
        </Box>
      ))}

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selected?.name}
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", right: 10, top: 10 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Typography><b>What it is:</b> {selected?.details?.intro}</Typography>
          <Typography sx={{ mt: 2 }}><b>Why it matters:</b> {selected?.details?.importance}</Typography>
          <Typography sx={{ mt: 2 }}><b>Common Sources:</b> {selected?.details?.sources}</Typography>
          <Typography sx={{ mt: 2 }}><b>Safe Levels:</b> {selected?.details?.safe}</Typography>
          <Typography sx={{ mt: 2 }}><b>Health Effects:</b> {selected?.details?.effects}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography><b>What you should do:</b> {selected?.details?.tips}</Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}