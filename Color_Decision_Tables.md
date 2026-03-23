# Air Quality Dashboard — Color Decision Tables

**Dashboard:** Air Quality Monitor  
**Location:** Air Quality Nexus Center, Bangkok  
**Date:** March 2026

---

## WHO Reference Values (for comparison)

| Metric | WHO Guideline | Standard |
|---|---|---|
| PM 2.5 | 15 µg/m³ (24-hour mean) | WHO AQG 2021 |
| PM 10 | 45 µg/m³ (24-hour mean) | WHO AQG 2021 |
| CO₂ | < 1,000 ppm (indoor) | WHO Indoor Air Quality |
| TVOC | < 300 ppb (indoor) | WHO IAQA Guidelines 2010 |
| Temperature | 18 – 24°C (thermal comfort) | WHO Housing & Health Guidelines 2018 |

> **Note:** Thailand PCD PM2.5 thresholds align with WHO AQG 2021 — the "Very Good" level (< 15 µg/m³) matches the WHO 24h guideline exactly.

---

## 1. PM 2.5 (µg/m³)

> Standard: Thailand Pollution Control Department (PCD) — air4thai.pcd.go.th

| Range (µg/m³) | Color | Level |
|---|---|---|
| < 15 | 🔵 Blue | Very Good |
| 15 – 24.9 | 🟢 Green | Good |
| 25 – 37.4 | 🟡 Yellow | Moderate |
| 37.5 – 74.9 | 🟠 Orange | Unhealthy (Sensitive Groups) |
| ≥ 75 | 🔴 Red | Unhealthy |

---

## 2. PM 10 (µg/m³)

> Standard: Thailand Pollution Control Department (PCD) — air4thai.pcd.go.th

| Range (µg/m³) | Color | Level |
|---|---|---|
| < 50 | 🔵 Blue | Very Good |
| 50 – 79 | 🟢 Green | Good |
| 80 – 119 | 🟡 Yellow | Moderate |
| 120 – 179 | 🟠 Orange | Unhealthy (Sensitive Groups) |
| ≥ 180 | 🔴 Red | Unhealthy |

---

## 3. CO₂ (ppm)

> Standard: ASHRAE 62.1 Indoor Air Quality Guidelines

| Range (ppm) | Color | Level |
|---|---|---|
| < 800 | 🟢 Green | Good |
| 800 – 999 | 🟡 Yellow | Moderate |
| 1,000 – 1,499 | 🟠 Orange | Poor |
| ≥ 1,500 | 🔴 Red | Very Poor |

---

## 4. Temperature (°C)

> Standard: ASHRAE 55 Thermal Comfort Standard

| Range (°C) | Color | Level |
|---|---|---|
| < 18 | 🔵 Blue | Cool |
| 18 – 27.9 | 🟢 Green | Comfortable |
| 28 – 34.9 | 🟡 Yellow | Warm |
| ≥ 35 | 🔴 Red | Hot |

---

## 5. TVOC (ppb)

> Standard: WHO / German Federal Environment Agency (UBA) Indoor Air Guidelines

| Range (ppb) | Color | Level |
|---|---|---|
| < 220 | 🟢 Green | Good |
| 220 – 659 | 🟡 Yellow | Moderate |
| 660 – 2,199 | 🟠 Orange | Poor |
| ≥ 2,200 | 🔴 Red | Very Poor |

---

## 6. Air4Thai / PCD Reference Station

> Station: Don Mueang District Office, Bangkok (station ID: bkp74t)  
> Applies to PM 2.5, PM 10, and AQI values returned by the Air4Thai API

| color_id (from API) | Color | Level |
|---|---|---|
| 1 | 🔵 Blue | Very Good |
| 2 | 🟢 Green | Good |
| 3 | 🟡 Yellow | Moderate |
| 4 | 🟠 Orange | Unhealthy (Sensitive Groups) |
| 5 | 🔴 Red | Unhealthy |

---

## Data Sources

| Metric | Standard / Reference |
|---|---|
| PM 2.5, PM 10 | Thailand PCD (air4thai.pcd.go.th) |
| CO₂ | ASHRAE 62.1 Indoor Air Quality |
| Temperature | ASHRAE 55 Thermal Comfort |
| TVOC | WHO / German UBA Indoor Air Guidelines |
| Air4Thai color_id | Thailand PCD Air4Thai API |
