<div align="center">
  
# 🏥 NearCare

### _Healthcare Made Accessible, One Click Away_

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

<br/>

**NearCare** is a comprehensive healthcare platform that helps users find nearby pharmacies with required medicines and book clinic appointments seamlessly — reducing time and effort, especially for elderly people.

[🚀 Live Demo](#) • [📖 Documentation](#features) • [🐛 Report Bug](https://github.com/yourusername/nearcare/issues)

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" width="100%"/>

</div>

## ✨ Features

### 👤 For Patients

| Feature                    | Description                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| 🔍 **Medicine Search**     | Find medicines at nearby pharmacies with real-time stock availability |
| 🗺️ **Interactive Maps**    | View pharmacy locations on OpenStreetMap with routing directions      |
| 📅 **Appointment Booking** | Book appointments at clinics with live queue tracking                 |
| 🎫 **Token System**        | Real-time "Now Serving" updates so you never miss your turn           |
| 📱 **Mobile Friendly**     | Fully responsive design works on all devices                          |

### 🏪 For Pharmacies

| Feature                     | Description                                                               |
| --------------------------- | ------------------------------------------------------------------------- |
| 📸 **AI Inventory Scanner** | Snap a photo of medicine shelves — AI auto-detects medicines using Gemini |
| 📦 **Stock Management**     | Add, edit, and manage inventory with expiry tracking                      |
| 📍 **Location Setup**       | Set your pharmacy location for patients to find you                       |
| 📊 **Dashboard**            | Overview of your inventory and business metrics                           |

### 🩺 For Clinics/Doctors

| Feature                  | Description                                         |
| ------------------------ | --------------------------------------------------- |
| 📋 **Appointment Queue** | Manage patient appointments with one-click actions  |
| 🔢 **Token Management**  | Update "Now Serving" token for live patient updates |
| ⏰ **Schedule Settings** | Configure clinic timings and appointment slots      |
| ✅ **Patient Tracking**  | Mark patients as arrived, in-progress, or completed |

<br/>

## 🛠️ Tech Stack

<div align="center">

| Frontend       | Backend            | AI/ML                   | Maps            |
| -------------- | ------------------ | ----------------------- | --------------- |
| React 19       | Firebase Firestore | Google Gemini 1.5 Flash | Leaflet         |
| Vite 7         | Firebase Auth      | Image Recognition       | OpenStreetMap   |
| Tailwind CSS 4 | Cloud Functions    | Natural Language        | Routing Machine |
| Framer Motion  | Real-time Sync     | Vision API              | Geolocation     |

</div>

<br/>

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Firebase Account** ([Create one here](https://firebase.google.com/))
- **Google AI API Key** ([Get it here](https://makersuite.google.com/app/apikey))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/nearcare.git
cd nearcare

# 2. Navigate to frontend
cd frontend

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env
```

### Environment Setup

Create a `.env` file in the `frontend` folder:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini AI (for Medicine Scanner)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

<br/>

## 📁 Project Structure

```
nearcare/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/           # Images and static files
│   │   ├── components/       # React components
│   │   │   ├── LandingPage.jsx       # Animated hero landing
│   │   │   ├── Login.jsx             # Email link authentication
│   │   │   ├── UserHome.jsx          # Patient dashboard
│   │   │   ├── ClinicHome.jsx        # Doctor dashboard
│   │   │   ├── PharmacyHome.jsx      # Pharmacy dashboard
│   │   │   ├── InventoryScanner.jsx  # AI-powered scanner
│   │   │   ├── BookAppointment.jsx   # Clinic finder & booking
│   │   │   ├── UserFindMedicine.jsx  # Medicine search
│   │   │   ├── OSMMapView.jsx        # Map component
│   │   │   └── ...
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── services/         # API services (aiService.js)
│   │   ├── App.jsx           # Main routing
│   │   ├── firebaseConfig.js # Firebase initialization
│   │   └── main.jsx          # Entry point
│   ├── .env                  # Environment variables
│   └── package.json
└── README.md
```

<br/>

## 🔐 Authentication Flow

NearCare uses **Firebase Email Link Authentication** (passwordless):

1. User enters email on login page
2. Magic link sent to email
3. User clicks link → automatically signed in
4. First-time users select their role (Patient/Clinic/Pharmacy)
5. Role-based dashboard redirect

<br/>

## 📸 AI Medicine Scanner

The inventory scanner uses **Google Gemini 1.5 Flash** to:

1. 📷 Capture image of medicine shelf/strips
2. 🔄 Compress image to optimal size (max 1024px)
3. 🤖 AI analyzes and extracts:
   - Medicine name
   - Dosage (mg/ml)
   - Type (Tablet/Syrup/Injection/etc.)
   - Estimated stock count
4. ✏️ User can edit/verify before saving
5. 💾 One-click save to inventory

<br/>

## 🗺️ Maps Integration

- **OpenStreetMap** via Leaflet for free, open-source mapping
- **Geolocation API** to detect user's current location
- **Routing Machine** for directions to pharmacies/clinics
- **Custom markers** for pharmacies and clinics

<br/>

## 📱 Screenshots

<div align="center">
  
| Landing Page | Patient Dashboard | Medicine Search |
|:---:|:---:|:---:|
| 🏠 Animated hero | 📊 Quick actions | 🔍 Real-time stock |

|  Clinic Queue   | Pharmacy Scanner | Appointment Booking |
| :-------------: | :--------------: | :-----------------: |
| 📋 Token system | 📸 AI detection  |  📅 Slot selection  |

</div>

<br/>

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<br/>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<br/>

## 👨‍💻 Author

**Chetan Srivastav**

- GitHub: [@chetan-coder5486](https://github.com/yourusername)

<br/>

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ for better healthcare accessibility

</div>
