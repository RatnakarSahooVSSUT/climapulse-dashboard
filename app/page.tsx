"use client";

import {
  Grid, Paper, Typography, Box, Divider, Chip,
  Dialog, DialogTitle, DialogContent
} from "@mui/material";

import {
  Air, DeviceThermostat, Opacity, Speed, Grain
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";

import {
  collection, query, orderBy, limit, onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* 🔥 NEON STYLE */
const neon = (color:string)=>({
  border: `1px solid ${color}`,
  boxShadow: `0 0 8px ${color}, 0 0 20px ${color}55`,
  transition: "0.3s",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: `0 0 20px ${color}`,
  },
});

/* AQI (6 LEVEL CPCB) */
const getAQILevel=(v:number)=>{
  if(v<=50) return ["Good","#00e400"];
  if(v<=100) return ["Satisfactory","#a3e635"];
  if(v<=200) return ["Moderate","#facc15"];
  if(v<=300) return ["Poor","#f97316"];
  if(v<=400) return ["Very Poor","#ef4444"];
  return ["Severe","#7e0023"];
};

export default function Home(){

  const [data,setData]=useState<any>(null);
  const [lastUpdated,setLastUpdated]=useState("");
  const [isLive,setIsLive]=useState(false);
  const [lastTimestamp,setLastTimestamp]=useState<Date|null>(null);
  const [selected,setSelected]=useState<any>(null);

  const theme=useTheme();
  const isDark=theme.palette.mode==="dark";

  /* FIREBASE (UNCHANGED) */
  useEffect(()=>{
    const q=query(collection(db,"sensor_data"),orderBy("timestamp","desc"),limit(1));

    const unsubscribe=onSnapshot(q,(snapshot)=>{
      if(!snapshot.empty){
        const d=snapshot.docs[0].data();
        setData(d);

        if(d.timestamp){
          const ts=d.timestamp.toDate();
          setLastTimestamp(ts);
          setLastUpdated(ts.toLocaleString());
          setIsLive(true);
        }
      }
    });

    return()=>unsubscribe();
  },[]);

  useEffect(()=>{
    const interval=setInterval(()=>{
      if(!lastTimestamp)return;
      const diff=(new Date().getTime()-lastTimestamp.getTime())/1000;
      setIsLive(diff<=15);
    },5000);

    return()=>clearInterval(interval);
  },[lastTimestamp]);

  if(!data)return <Typography>Loading...</Typography>;

  const format=(v:any)=> typeof v==="number"?v.toFixed(2):v;

  /* 🔥 CLASSIFICATION */

  const getLevel=(v:number,type:string)=>{

    // PM2.5
    if(type==="pm25"){
      if(v<=30) return ["Good","#00e400"];
      if(v<=60) return ["Satisfactory","#a3e635"];
      if(v<=90) return ["Moderate","#facc15"];
      if(v<=120) return ["Poor","#f97316"];
      return ["Very Poor","#ef4444"];
    }

    // PM10
    if(type==="pm10"){
      if(v<=50) return ["Good","#00e400"];
      if(v<=100) return ["Satisfactory","#a3e635"];
      if(v<=250) return ["Moderate","#facc15"];
      if(v<=350) return ["Poor","#f97316"];
      return ["Very Poor","#ef4444"];
    }

    // CO
    if(type==="co"){
      if(v<=2) return ["Safe","#00ff9c"];
      if(v<=10) return ["Moderate","#facc15"];
      return ["Unsafe","#ff3b3b"];
    }

    // NO2
    if(type==="no2"){
      if(v<=1) return ["Safe","#00ff9c"];
      if(v<=10) return ["Moderate","#facc15"];
      return ["Unsafe","#ff3b3b"];
    }

    // CH4
    if(type==="ch4"){
      if(v<1) return ["Safe","#00ff9c"];
      if(v<5) return ["Moderate","#facc15"];
      return ["Risk","#ff3b3b"];
    }

    // CO2
    if(type==="co2"){
      if(v<=800) return ["Optimal","#00ff9c"];
      if(v<=1500) return ["Acceptable","#facc15"];
      return ["Poor","#ff3b3b"];
    }

    // TEMP
    if(type==="temp"){
      if(v<18) return ["Low","#3b82f6"];
      if(v<=30) return ["Comfort","#00ff9c"];
      return ["High","#ff3b3b"];
    }

    // HUMIDITY
    if(type==="hum"){
      if(v<30) return ["Low","#3b82f6"];
      if(v<=60) return ["Normal","#00ff9c"];
      return ["High","#ff3b3b"];
    }

    // PRESSURE
    if(type==="pres"){
      if(v<980) return ["Low","#3b82f6"];
      if(v<=1020) return ["Normal","#00ff9c"];
      return ["High","#ff3b3b"];
    }

    return ["Normal","#6366f1"];
  };

  /* 🔥 MODAL TABLE */
  const getAQIRanges = () => [
  ["Good","0-50","#00e400"],
  ["Satisfactory","51-100","#a3e635"],
  ["Moderate","101-200","#facc15"],
  ["Poor","201-300","#f97316"],
  ["Very Poor","301-400","#ef4444"],
  ["Severe","401-500","#7e0023"],
  ];

  const getRanges=(type:string)=>{

    if(type==="pm25") return [
      ["Good","0-30","#00e400"],
      ["Satisfactory","30-60","#a3e635"],
      ["Moderate","60-90","#facc15"],
      ["Poor","90-120","#f97316"],
      ["Very Poor","120+","#ef4444"],
    ];

    if(type==="pm10") return [
      ["Good","0-50","#00e400"],
      ["Satisfactory","50-100","#a3e635"],
      ["Moderate","100-250","#facc15"],
      ["Poor","250-350","#f97316"],
      ["Very Poor","350+","#ef4444"],
    ];

    if(type==="co") return [
      ["Safe","0-2 ppm","#00ff9c"],
      ["Moderate","2-10 ppm","#facc15"],
      ["Unsafe","10+ ppm","#ff3b3b"],
    ];

    if(type==="no2") return [
      ["Safe","0-1 ppm","#00ff9c"],
      ["Moderate","1-10 ppm","#facc15"],
      ["Unsafe","10+ ppm","#ff3b3b"],
    ];

    if(type==="ch4") return [
      ["Safe","<1 ppm","#00ff9c"],
      ["Moderate","1-5 ppm","#facc15"],
      ["Risk",">5 ppm","#ff3b3b"],
    ];

    if(type==="co2") return [
      ["Optimal","400-800","#00ff9c"],
      ["Acceptable","800-1500","#facc15"],
      ["Poor","1500+","#ff3b3b"],
    ];

    if(type==="temp") return [
      ["Low","<18°C","#3b82f6"],
      ["Comfort","18-30°C","#00ff9c"],
      ["High",">30°C","#ff3b3b"],
    ];

    if(type==="hum") return [
      ["Low","<30%","#3b82f6"],
      ["Normal","30-60%","#00ff9c"],
      ["High",">60%","#ff3b3b"],
    ];

    if(type==="pres") return [
      ["Low","<980 hPa","#3b82f6"],
      ["Normal","980-1020","#00ff9c"],
      ["High",">1020","#ff3b3b"],
    ];

    return [];
  };

  const [aqiLabel,aqiColor]=getAQILevel(data.aqi);

  return (
    <>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          System Overview
        </Typography>

        {/* AQI LEGEND */}
        <Box display="flex" gap={1}>
          {["Good","Satisfactory","Moderate","Poor","Very Poor","Severe"].map((l,i)=>{
            const c=["#00e400","#a3e635","#facc15","#f97316","#ef4444","#7e0023"];
            return <Chip key={i} label={l} sx={{background:c[i]}}/>
          })}
        </Box>
      </Box>

      <Typography sx={{opacity:0.7}}>
        Last Updated: {lastUpdated}
      </Typography>

      <Divider sx={{my:3}}/>

      {/* AQI + STATUS */}
      <Grid container spacing={2}>
        <Grid size={{xs:12,md:4}}>
          <Paper
            onClick={() => setSelected(["AQI", data.aqi, "AQI Index", "aqi"])}
            sx={{
              p:3,
              borderRadius:4,
              cursor:"pointer",
              ...neon(aqiColor)
            }}
          >
            <Typography>AQI</Typography>
            <Typography variant="h3">{format(data.aqi)}</Typography>
            <Chip label={aqiLabel} sx={{background:aqiColor}}/>
          </Paper>
        </Grid>

        <Grid size={{xs:12,md:8}}>
          <Paper sx={{p:3,borderRadius:4,...neon(isLive?"#00ff9c":"#ff3b3b")}}>
            <Typography>System Status</Typography>
            <Typography>Device: {isLive?"Online":"Offline"}</Typography>
            <Typography>Network: {isLive?"Active":"Inactive"}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{my:4}}/>

      {/* CARDS */}
      <Grid container spacing={2}>
        {[
          ["PM2.5",data.pm25,"µg/m³","pm25"],
          ["PM10",data.pm10,"µg/m³","pm10"],
          ["CO2",data.co2,"ppm","co2"],
          ["CO",data.co,"ppm","co"],
          ["CH4",data.ch4,"ppm","ch4"],
          ["NO2",data.no2,"ppm","no2"],
          ["Temp",data.temperature,"°C","temp"],
          ["Humidity",data.humidity,"%","hum"],
          ["Pressure",data.pressure,"hPa","pres"],
        ].map((item,i)=>{
          const [label,color]=getLevel(item[1],item[3]);

          return(
            <Grid key={i} size={{xs:12,sm:6,md:4}}>
              <Paper
                onClick={()=>setSelected(item)}
                sx={{
                  p:2,
                  borderRadius:4,
                  backdropFilter:"blur(10px)",
                  background:isDark?"rgba(15,23,42,0.6)":"rgba(255,255,255,0.6)",
                  cursor:"pointer",
                  ...neon(color)
                }}
              >
                <Typography>{item[0]}</Typography>
                <Typography variant="h6">
                  {format(item[1])} {item[2]}
                </Typography>
                <Chip label={label} sx={{background:color}}/>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      {/* MODAL */}
      <Dialog open={!!selected} onClose={()=>setSelected(null)} fullWidth>
        {selected && (
          <>
            <DialogTitle>{selected[0]}</DialogTitle>
            <DialogContent>
              <Typography variant="h5">
                {format(selected[1])} {selected[3]==="aqi" ? "" : selected[2]}
              </Typography>

              {(selected[3] === "aqi"? getAQIRanges(): getRanges(selected[3])).map((r,i)=>(
                <Box key={i}
                  sx={{
                    display:"flex",
                    justifyContent:"space-between",
                    p:1,
                    mb:1,
                    border:`1px solid ${r[2]}`
                  }}
                >
                  <Typography>{r[0]}</Typography>
                  <Typography>{r[1]}</Typography>
                </Box>
              ))}
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}