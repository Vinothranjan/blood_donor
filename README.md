# LifePulse AI — Pan-India Smart Blood Finder

**LifePulse AI** is an advanced, AI-powered healthcare web platform connecting patients, hospitals, blood donors, and registered blood banks across all 36 Indian States & Union Territories in real-time.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Patient / Hospital Portal**: Instant emergency blood search & verified donor lookup without password requirements.
   - **Blood Donor Portal**: Secure profile management, availability toggling, emergency alerts, and verified donation certificates.
   - **Blood Bank Portal**: Real-time blood matrix inventory management, incoming request dispatching, and QR donation verification.
   - **Admin Command Center**: District network oversight, facility verification queue, emergency mass broadcasts, and cryptographic audit log.

2. **AI & Proximity Engine**:
   - Dynamic compatibility matching algorithm.
   - Leaflet interactive map radar showing nearby donors and verified blood banks.

3. **Digital Certification & Blockchain Audit Ledger**:
   - Cryptographically hashed QR donation certificates for donor verification.

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites
- Python 3.8 or higher installed on the host system.

### 2. Install Dependencies
Open Terminal / Command Prompt in the project folder and run:
```bash
pip install -r requirements.txt
```

### 3. Start Application Server
Run the local dev server:
```bash
python serve.py
```
*(Alternatively: `python -m http.server 8000`)*

### 4. Access Application
Open your browser and go to:
👉 **`http://localhost:8000`**

---

## 🔐 Demo Credentials

| Role | Identifier / Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@lifepulse.org` | `admin123` | Full Pan-India System Oversight |
| **Blood Bank** | `BB-TN-CHENNAI-001` | `bank123` | Inventory & Verification Controls |
| **Blood Donor** | `+91 98401 22104` | `donor123` | Donor Profile & History |
| **Patient / Hospital** | Public Access | None | Emergency Donor & Stock Search |

---

## 📁 Project Structure

```text
├── index.html              # Main Single-Page Application (SPA) UI
├── styles.css              # LifePulse AI Premium CSS Theme & Animations
├── serve.py                # Development HTTP Server with No-Cache Headers
├── requirements.txt        # Client Python Dependencies
├── to run the program.txt  # Quick Execution Instructions
└── js/                     # Core Modular Engine
    ├── app.js              # RBAC Router, User Session & Portal State Engine
    ├── ai_matching.js       # AI Donor Matching Engine
    ├── blockchain.js        # Cryptographic Audit Ledger
    ├── data.js             # Pan-India District & Donor Store
    ├── i18n.js             # Multi-Language Translation System
    ├── map_engine.js       # Leaflet Proximity Map Radar
    ├── nlp_assistant.js    # AI Voice & Natural Language Assistant
    ├── privacy_shield.js   # Geolocation Anonymization Privacy Shield
    └── qr_engine.js        # Vector QR Code Generation Engine
```
