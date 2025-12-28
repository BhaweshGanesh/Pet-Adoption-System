import React from "react";
import { Link } from "react-router-dom";

const PetHostelService = () => {
  const features = [
    {
      icon: "🏨",
      title: "Comfortable Accommodation",
      description: "Spacious, clean, and climate-controlled rooms for every pet"
    },
    {
      icon: "👨‍⚕️",
      title: "24/7 Supervision",
      description: "Round-the-clock care and monitoring by trained staff"
    },
    {
      icon: "🎮",
      title: "Play & Exercise",
      description: "Daily activities, walks, and socialization sessions"
    },
    {
      icon: "🍽️",
      title: "Nutritious Meals",
      description: "Custom diet plans and regular feeding schedules"
    }
  ];

  const amenities = [
    "Individual climate-controlled rooms with comfortable bedding",
    "Daily exercise, playtime, and socialization activities",
    "Grooming and bathing services available",
    "24/7 CCTV surveillance for safety and security",
    "Daily photo/video updates to owners",
    "Separate areas for dogs and cats",
    "Hygiene protocols and regular sanitization"
  ];

  const roomTypes = [
    {
      title: "Standard Room",
      features: ["Cozy bed", "Regular meals", "Daily walks", "Play sessions"],
      image: "/photo/Standard.jpg"
    },
    {
      title: "Deluxe Suite",
      features: ["Spacious room", "Premium meals", "Extra playtime", "Grooming"],
      image: "/photo/Deluxe.jpg"
    },
    {
      title: "VIP Suite",
      features: ["Private space", "Gourmet meals", "Personal care", "Spa services"],
      image: "/photo/VIP.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-20 bg-white border-b border-blue-100/80 px-6 lg:px-16 py-4 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🐾</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">
            Pet<span className="text-orange-500">Adopt+</span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-6 text-sm text-slate-600">
          <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <Link to="/adoption-service" className="hover:text-orange-500 transition-colors">Adoption</Link>
          <Link to="/hostel-service" className="text-orange-500 font-semibold">Pet Hostel</Link>
          <Link to="/store-service" className="hover:text-orange-500 transition-colors">Pet Store</Link>
         
        </nav>

        
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 lg:px-16 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-blue-50 to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                🏨 Pet Hostel Service
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                A Home Away from
                <span className="text-orange-500"> Home</span> for Your Pet
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Our pet hostel offers a safe, comfortable, and stress-free environment for pets when their 
                owners are away. With proper supervision, hygiene, and personalized care, we ensure that 
                every pet feels secure, relaxed, and well cared for throughout their stay.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/login"
                  className="px-8 py-4 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Book a Stay
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <img
                  src="/photo/dog.webp"
                  alt="Happy pet at hostel"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="text-4xl font-bold text-orange-500">24/7</div>
                <div className="text-sm text-slate-600">Care & Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-6 lg:px-16 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose Our Pet Hostel?</h2>
            <p className="text-lg text-slate-600">Professional care with a personal touch</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100"
              >
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROOM TYPES */}
      <section className="px-6 lg:px-16 py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Choose the Perfect Stay</h2>
            <p className="text-lg text-slate-600">Comfortable accommodations tailored to your pet's needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roomTypes.map((room, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-orange-500"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{room.title}</h3>
                  <div className="text-3xl font-bold text-orange-500 mb-4">{room.price}</div>
                  <ul className="space-y-2 mb-6">
                    {room.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-600">
                        <span className="text-orange-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/admin-hostel-management"
                    className="block w-full text-center px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-all"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AMENITIES LIST */}
      <section className="px-6 lg:px-16 py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold mb-6">Complete Amenities & Care</h2>
              <p className="text-slate-300 text-lg mb-8">
                Every pet receives personalized attention and care in our modern, well-equipped facility. 
                We maintain the highest standards of hygiene, comfort, and safety.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 group hover:translate-x-2 transition-transform bg-slate-800 p-4 rounded-xl"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                      ✓
                    </div>
                    <p className="text-slate-200 text-sm">{amenity}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform">
                <img src="/photo/cat.jpeg" alt="Pet care" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform mt-8">
                <img src="/photo/labrador-retriever.jpeg" alt="Pet hostel room" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform -mt-8">
                <img src="/photo/dog.webp" alt="Happy pet" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform">
                <img src="/photo/cat.jpeg" alt="Pet playing" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* CTA SECTION */}
      <section className="px-6 lg:px-16 py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Plan Your Next Trip Worry-Free
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Book your pet's stay today and enjoy your vacation knowing they're in great hands
          </p>
          <Link
            to="/login"
            className="inline-block px-10 py-4 bg-white text-orange-500 rounded-full font-bold text-lg hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Book Your Pet's Stay
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-8 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">🐾</span>
            </div>
            <span className="text-xl font-bold">
              Pet<span className="text-orange-500">Adopt+</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            © 2025 PetAdopt+. All rights reserved. | Your pet's comfort is our priority.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PetHostelService;

