import Navbar from "./Navbar";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          About NearCare 🏥
        </h1>

        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Making healthcare access simple, transparent, and stress-free for everyone.
        </p>

        {/* Main content */}
        <div className="bg-white/80 rounded-2xl shadow-md p-8 space-y-6 text-gray-700 text-lg leading-relaxed">
          <p>
            <strong>NearCare</strong> is built to solve a very real problem — long waiting
            times, confusion at clinics, and lack of visibility for patients.
          </p>

          <p>
            We help patients know <strong>where to go</strong>, <strong>when to go</strong>,
            and <strong>how long they might have to wait</strong>, even before leaving home.
          </p>

          <p>
            Doctors can manage their live queue with a single click, while patients
            receive real-time updates about their appointment status.
          </p>

          <p>
            Our goal is to reduce overcrowding, save time, and make clinic visits
            comfortable — especially for elderly patients and families.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              👨‍⚕️ For Clinics
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Live queue management</li>
              <li>Call next patient instantly</li>
              <li>Reduced crowding</li>
              <li>Better patient flow</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              🧑‍🤝‍🧑 For Patients
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>See estimated waiting time</li>
              <li>Choose clinics smartly</li>
              <li>Live appointment status</li>
              <li>Elder-friendly experience</li>
            </ul>
          </div>
        </div>

        {/* Footer message */}
        <div className="mt-12 text-center text-gray-600 text-lg">
          <p>
            ❤️ Built with care, simplicity, and respect for your time.
          </p>
          <p className="mt-1 font-semibold">
            NearCare — Healthcare, without the wait.
          </p>
        </div>
      </div>
    </div>
  );
}
