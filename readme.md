# 🌐 OPC Digital Twin

A **Digital Twin Visualization Platform** built with a **Node.js backend** and an **Angular frontend**.  
It enables researchers and engineers to visualize **real-time weather conditions**, analyze **historical trends**, and integrate data into a **digital twin environment** (e.g., greenhouse, smart factory).

---

## 📖 Table of Contents
- [Introduction](#introduction)
- [Objectives](#objectives)
- [System Architecture](#system-architecture)
- [Backend Documentation](#backend-documentation)
- [Frontend Documentation](#frontend-documentation)
- [Features Implemented](#features-implemented)
- [Deployment](#deployment)
  - [Run Locally](#run-locally)
  - [Run with Docker](#run-with-docker)
- [Future Enhancements](#future-enhancements)
- [Conclusion](#conclusion)

---

## 1. 🚀 Introduction
This project provides a Digital Twin Visualization Platform with two main components:

- **Backend (Node.js + Express + Open-Meteo)**  
  Handles communication with the [Open-Meteo API](https://open-meteo.com) to retrieve real-time and historical weather data.

- **Frontend (Angular)**  
  Displays sensor data, historical queries, and 3D digital twin visualizations.

---

## 2. 🎯 Objectives

### Task 1 – Real-time & Historical Data Interface
- Display live sensor values (temperature, humidity).
- Provide filters for historical queries (date range, location).
- Present data in dashboards, charts, and tables.

### Task 3 – Digital Twin Interface
- Build a graphical 3D visualization (using **Three.js** or **Babylon.js**).
- Link live sensor data with animations  
  *(e.g., temperature = color scale, humidity = environmental effect)*.
- Support historical replay of data in the twin.

---

## 3. 🏗️ System Architecture

### 3.1 Data Flow
1. **Frontend (Angular)** → Sends request to backend (Realtime, Historical, Combined).  
2. **Backend (Node.js + Express)** → Fetches data from Open-Meteo API.  
3. **Caching Layer** → Avoids redundant API calls.  
4. **Frontend UI** → Displays results in charts, tables, and 3D twin.  

### 3.2 Simplified Architecture Diagram
User (Browser)
|
Angular UI
|
TemperatureService (HTTP)
|
Express Backend
|
Open-Meteo API

yaml
Copy code

---

## 4. 🔧 Backend Documentation

### Technologies
- Node.js + Express (server)
- Axios (API calls)
- CORS (frontend access)

### API Endpoints
- `GET /api/realtime` → Real-time temperature & humidity  
- `GET /api/historical` → Historical hourly values (requires date range)  
- `GET /api/combined` → Realtime + historical in one call  
- `GET /api/health` → Health check  

### Features
- **Caching**
  - Realtime data cached for **1 min**  
  - Historical data cached for **1 hour**  
- **Error Handling**
  - Returns structured JSON error messages  

---

## 5. 🎨 Frontend Documentation

### Angular Service: `temperature.service.ts`
- `getRealtime(lat, lon)` → Fetches real-time weather  
- `getHistorical(lat, lon, startDate, endDate)` → Fetches historical weather  
- `getCombined(lat, lon, startDate, endDate)` → Fetches both realtime + historical  
- `getDefaultLocation()` → Returns default coordinates *(Almería, Spain 🇪🇸)*  

---

## 6. ✅ Features Implemented

### Task 1 – Real-time & Historical Data
- Dashboard cards for live values  
- Auto-updating charts for real-time data  
- Historical queries with date range filters  

### Task 3 – Digital Twin
- 3D visualization of an environment  
- Live data integration (temperature, humidity)  
- Replay of historical conditions in the twin  

---

## 7. ⚙️ Deployment

### ▶️ Run Locally

#### Start Backend
```bash
cd opcua-backend
npm install
node server.js
Start Frontend
bash
Copy code
cd opcua-Frontend
npm install
ng serve
🐳 Run with Docker
This project includes a docker-compose.yml for containerized setup.

1. Build & Start
From the project root:

bash
Copy code
docker-compose up --build
This will:

Build the backend container (Node.js + Express)

Build the frontend container (Angular app)

Start both containers and link them together

2. Access the App
Frontend → http://localhost:4200

Backend API → http://localhost:3000

3. Stop Containers
bash
Copy code
docker-compose down
4. Run in Background (detached mode)
bash
Copy code
docker-compose up -d
8. 🔮 Future Enhancements
Add a database (MongoDB/PostgreSQL) to persist historical data

Secure API with JWT authentication

Add WebSocket for live streaming instead of polling

Improve digital twin with advanced 3D animations

Make frontend fully mobile responsive

9. 🏁 Conclusion
This project successfully integrates:

A backend API that fetches and caches real-time + historical data

A frontend Angular service that consumes backend APIs

A foundation for a digital twin visualization interface

