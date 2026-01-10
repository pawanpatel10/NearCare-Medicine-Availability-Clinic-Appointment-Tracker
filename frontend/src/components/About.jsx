import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="relative rounded-[2rem] p-[2px] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-2xl shadow-teal-500/20 mb-16 animate-fade-in-up">
          <div className="glass-card rounded-[calc(2rem-2px)] p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/40 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-cyan-200/40 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <span className="text-4xl">🏥</span>
                </div>
                <div>
                  <p className="text-teal-600 font-semibold uppercase tracking-wider text-sm">Welcome to</p>
                  <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    NearCare
                  </h1>
                </div>
              </div>
              <p className="text-xl text-slate-700 max-w-2xl leading-relaxed">
                Your intelligent healthcare companion. Connecting patients, clinics, and pharmacies seamlessly through real-time technology.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <section className="mb-16 animate-fade-in-up delay-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-500/20">
              <div className="glass-card rounded-[calc(1.5rem-2px)] p-8 h-full">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Our Mission</h3>
                <p className="text-slate-600">Eliminate waiting times, reduce healthcare chaos, and empower patients with transparent, real-time information about their medical visits.</p>
              </div>
            </div>

            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg shadow-purple-500/20">
              <div className="glass-card rounded-[calc(1.5rem-2px)] p-8 h-full">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Our Vision</h3>
                <p className="text-slate-600">A healthcare ecosystem where every patient gets timely care, every clinic operates efficiently, and every pharmacy is instantly accessible.</p>
              </div>
            </div>

            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/20">
              <div className="glass-card rounded-[calc(1.5rem-2px)] p-8 h-full">
                <div className="text-4xl mb-4">❤️</div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Our Values</h3>
                <p className="text-slate-600">Simplicity, transparency, and respect for everyone's time. Built with care for patients, doctors, and pharmacists alike.</p>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="mb-16 animate-fade-in-up delay-200">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">The Problem We Solve</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-red-400 to-pink-500 shadow-lg shadow-red-500/20">
              <div className="glass-card rounded-[calc(1.5rem-2px)] p-8">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">⏱️</div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2">Long Waiting Times</h4>
                    <p className="text-slate-600">Patients spend hours at clinics without knowing how long they'll wait or what position they're in the queue.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-red-400 to-pink-500 shadow-lg shadow-red-500/20">
              <div className="glass-card rounded-[calc(1.5rem-2px)] p-8">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">😕</div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2">Clinic Overcrowding</h4>
                    <p className="text-slate-600">Doctors face chaotic queues with no visibility into patient flow, making scheduling and management nearly impossible.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-red-400 to-pink-500 shadow-lg shadow-red-500/20">
              <div className="glass-card rounded-[calc(1.5rem-2px)] p-8">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🔍</div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2">Medicine Availability</h4>
                    <p className="text-slate-600">Patients struggle to find pharmacies with their prescribed medications, wasting time going door-to-door.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-red-400 to-pink-500 shadow-lg shadow-red-500/20">
              <div className="glass-card rounded-[calc(1.5rem-2px)] p-8">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📱</div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2">No Real-Time Updates</h4>
                    <p className="text-slate-600">Lack of transparency leaves patients confused and anxious about their appointment status and wait times.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Three User Roles */}
        <section className="mb-16 animate-fade-in-up delay-300">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">Designed for Everyone</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Patients */}
            <div className="group">
              <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-blue-500/30">
                <div className="glass-card rounded-[calc(1.5rem-2px)] p-8 h-full">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <span className="text-3xl">🧑‍🤝‍🧑</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 text-center mb-6">For Patients</h3>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-bold text-slate-800">💊 Search Medicines</h4>
                      <p className="text-slate-600 text-sm">Find nearby pharmacies with your prescription in stock instantly. Compare availability across multiple locations and choose the nearest option.</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-bold text-slate-800">📅 Book Appointments</h4>
                      <p className="text-slate-600 text-sm">Reserve slots at your preferred clinics with flexible scheduling. Choose doctors and time slots that work best for you.</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-bold text-slate-800">⏱️ Real-Time Status</h4>
                      <p className="text-slate-600 text-sm">Track your appointment live and know exactly when it's your turn. Get instant notifications as you move through the queue.</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-bold text-slate-800">🕐 Wait Time Visibility</h4>
                      <p className="text-slate-600 text-sm">Plan your visit with estimated waiting times before you leave home. No more wasted time or surprises.</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-bold text-slate-800">📋 My Appointments</h4>
                      <p className="text-slate-600 text-sm">Manage all your bookings in one place. View history, upcoming appointments, and cancel if needed.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* For Clinics */}
            <div className="group">
              <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-lg shadow-teal-500/20 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-teal-500/30">
                <div className="glass-card rounded-[calc(1.5rem-2px)] p-8 h-full">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <span className="text-3xl">👨‍⚕️</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 text-center mb-6">For Clinics & Doctors</h3>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-emerald-500 pl-4">
                      <h4 className="font-bold text-slate-800">📊 Live Queue Management</h4>
                      <p className="text-slate-600 text-sm">See all patients in real-time with instant updates. Monitor queue status and patient progress throughout your clinic hours.</p>
                    </div>
                    <div className="border-l-4 border-emerald-500 pl-4">
                      <h4 className="font-bold text-slate-800">▶️ Call Next Patient</h4>
                      <p className="text-slate-600 text-sm">One-click patient management with an organized queuing system. Reduce confusion and maintain smooth patient flow.</p>
                    </div>
                    <div className="border-l-4 border-emerald-500 pl-4">
                      <h4 className="font-bold text-slate-800">🎫 Token System</h4>
                      <p className="text-slate-600 text-sm">Organized patient flow with token numbers. Patients know exactly where they stand in the queue without confusion.</p>
                    </div>
                    <div className="border-l-4 border-emerald-500 pl-4">
                      <h4 className="font-bold text-slate-800">🛑 Booking Control</h4>
                      <p className="text-slate-600 text-sm">Pause or resume bookings as needed based on your capacity and workload. Prevent overbooking during peak hours.</p>
                    </div>
                    <div className="border-l-4 border-emerald-500 pl-4">
                      <h4 className="font-bold text-slate-800">⚙️ Clinic Settings</h4>
                      <p className="text-slate-600 text-sm">Manage your clinic profile, consultation fees, and operating hours easily. Keep your information up-to-date.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* For Pharmacies */}
            <div className="group">
              <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-500 shadow-lg shadow-purple-500/20 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-purple-500/30">
                <div className="glass-card rounded-[calc(1.5rem-2px)] p-8 h-full">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <span className="text-3xl">💊</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 text-center mb-6">For Pharmacies</h3>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-bold text-slate-800">📱 AI Inventory Scanner</h4>
                      <p className="text-slate-600 text-sm">AI-powered image recognition to scan medicine shelves. Simply take a photo and let AI detect medicines automatically.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-bold text-slate-800">🗄️ Medicine Database</h4>
                      <p className="text-slate-600 text-sm">Comprehensive inventory tracking and updates. Maintain accurate records of all medicines in your pharmacy.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-bold text-slate-800">🚨 Stock Alerts</h4>
                      <p className="text-slate-600 text-sm">Real-time notifications for low and out-of-stock items. Never miss a restock opportunity or disappoint customers.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-bold text-slate-800">🏪 Pharmacy Profile</h4>
                      <p className="text-slate-600 text-sm">Showcase your inventory and attract more customers. Build trust with transparent medicine availability information.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-bold text-slate-800">🔍 Patient Discovery</h4>
                      <p className="text-slate-600 text-sm">Patients find you when they search for medicines. Increase foot traffic and revenue through the platform's search feature.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16 animate-fade-in-up delay-400">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">Why NearCare?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg shadow-blue-500/20">
              <div className="glass-card rounded-[calc(1.5rem-2px)] p-6">
                <div className="text-4xl mb-4">⚡</div>
                <h4 className="font-bold text-slate-800 mb-2">Real-Time Updates</h4>
                <p className="text-slate-600 text-sm">Live queue updates and instant notifications keep everyone informed.</p>
              </div>
            </div>

            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-emerald-500/20">
              <div className="glass-card rounded-[calc(1.5rem-2px)] p-6">
                <div className="text-4xl mb-4">🔒</div>
                <h4 className="font-bold text-slate-800 mb-2">Secure & Private</h4>
                <p className="text-slate-600 text-sm">Your health data is protected with Firebase security and encryption.</p>
              </div>
            </div>

            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-500/20">
              <div className="glass-card rounded-[calc(1.5rem-2px)] p-6">
                <div className="text-4xl mb-4">📱</div>
                <h4 className="font-bold text-slate-800 mb-2">Mobile-First Design</h4>
                <p className="text-slate-600 text-sm">Seamlessly works on all devices - phones, tablets, and desktops.</p>
              </div>
            </div>

            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-rose-500/20">
              <div className="glass-card rounded-[calc(1.5rem-2px)] p-6">
                <div className="text-4xl mb-4">🌍</div>
                <h4 className="font-bold text-slate-800 mb-2">Easy Scaling</h4>
                <p className="text-slate-600 text-sm">Built with cloud infrastructure to support growth and expansion.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-16 animate-fade-in-up delay-500">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">Built With Modern Technology</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg shadow-purple-500/20">
              <div className="glass-card rounded-[calc(1.5rem-2px)] p-8">
                <h4 className="font-bold text-slate-800 mb-4 text-lg">Frontend</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>⚛️ React.js - Interactive UI</li>
                  <li>🎨 Tailwind CSS - Beautiful Styling</li>
                  <li>📦 Vite - Lightning-Fast Build</li>
                  <li>🔄 Real-time State Management</li>
                </ul>
              </div>
            </div>

            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-green-400 to-teal-500 shadow-lg shadow-teal-500/20">
              <div className="glass-card rounded-[calc(1.5rem-2px)] p-8">
                <h4 className="font-bold text-slate-800 mb-4 text-lg">Backend & Database</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>🔥 Firebase Firestore - Real-time DB</li>
                  <li>🔐 Firebase Auth - Secure Login</li>
                  <li>☁️ Cloud Infrastructure</li>
                  <li>⚙️ Automatic Scaling & Backups</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-16 animate-fade-in-up delay-600">
          <div className="relative rounded-[2rem] p-[2px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/30">
            <div className="glass-card rounded-[calc(2rem-2px)] p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-200/40 to-transparent rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-slate-800 mb-4">Ready to Transform Healthcare?</h2>
                <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                  Join NearCare today and experience a smarter way to manage healthcare for patients, doctors, and pharmacies.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => navigate("/login")}
                    className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                  >
                    Get Started Now
                  </button>
                  <button 
                    onClick={() => navigate("/")}
                    className="px-8 py-4 rounded-xl font-bold text-lg bg-white/20 backdrop-blur text-slate-800 hover:bg-white/30 transition-all duration-300 border-2 border-slate-300/30"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Stats */}
        <section className="py-12 border-t border-slate-300/20 animate-fade-in-up delay-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                100%
              </div>
              <p className="text-slate-600 mt-2">Free to Use</p>
            </div>
            <div>
              <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                24/7
              </div>
              <p className="text-slate-600 mt-2">Real-Time Updates</p>
            </div>
            <div>
              <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ∞
              </div>
              <p className="text-slate-600 mt-2">Always Growing</p>
            </div>
          </div>
        </section>

        {/* Final Message */}
        <div className="mt-16 text-center animate-fade-in-up delay-800">
          <p className="text-lg text-slate-600 mb-2">
            ❤️ Built with care, simplicity, and respect for your time.
          </p>
          <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            NearCare — Healthcare, without the wait.
          </p>
        </div>
      </main>
    </div>
  );
}
