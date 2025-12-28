import React from "react";
import { Link } from "react-router-dom";

const AdoptionService = () => {
  const features = [
    {
      icon: "❤️",
      title: "Trusted Platform",
      description: "Verified adoption process with complete transparency and support"
    },
    {
      icon: "🏥",
      title: "Health Assured",
      description: "All pets are vaccinated, health-checked, and ready for adoption"
    },
    {
      icon: "🤝",
      title: "Lifetime Support",
      description: "Guidance and support even after adoption to ensure success"
    },
    {
      icon: "📋",
      title: "Easy Process",
      description: "Simple adoption application with quick approval and minimal paperwork"
    }
  ];

  const services = [
    "Comprehensive pet health screening and vaccination records",
    "Home visit consultation for first-time pet parents",
    "Free training session for adopted dogs",
    "Access to pet care resources and community support",
  ];

  const adoptionSteps = [
    {
      step: "1",
      title: "Browse Pets",
      description: "Explore our available pets and find your perfect match"
    },
    {
      step: "2",
      title: "Apply",
      description: "Submit an adoption application with your details"
    },
    {
      step: "3",
      title: "Meet & Greet",
      description: "Visit the shelter and spend time with your chosen pet"
    },
    {
      step: "4",
      title: "Home Visit",
      description: "Our team ensures your home is pet-ready and safe"
    },
    {
      step: "5",
      title: "Adoption",
      description: "Complete paperwork and bring your new family member home"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-20 bg-white border-b border-orange-100/80 px-6 lg:px-16 py-4 flex items-center justify-between shadow-sm">
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
          <Link to="/adoption-service" className="text-orange-500 font-semibold">Adoption</Link>
          <Link to="/hostel-service" className="hover:text-orange-500 transition-colors">Pet Hostel</Link>
          <Link to="/store-service" className="hover:text-orange-500 transition-colors">Pet Store</Link>
        </nav>

        
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 lg:px-16 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100 via-orange-50 to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                🏠 Pet Adoption Service
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Give a Pet a Second Chance at
                <span className="text-orange-500"> Happiness</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                We provide a trusted and transparent platform that connects loving homes with pets in need. 
                Our adoption service focuses on animal welfare, responsible ownership, and creating lifelong 
                bonds between pets and families.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/Signup"
                  className="px-8 py-4 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  View Available Pets
                </Link>

                
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <img
                  src="/photo/dog.webp"
                  alt="Happy adopted dog"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="text-4xl font-bold text-orange-500">500+</div>
                <div className="text-sm text-slate-600">Happy Adoptions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-6 lg:px-16 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose Our Adoption Service?</h2>
            <p className="text-lg text-slate-600">We make pet adoption safe, transparent, and joyful</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100"
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

      {/* ADOPTION PROCESS */}
      <section className="px-6 lg:px-16 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple Adoption Process</h2>
            <p className="text-lg text-slate-600">Just 5 easy steps to bring your new friend home</p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {adoptionSteps.map((item, index) => (
              <div
                key={index}
                className="relative group"
              >
                <div className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-orange-100 hover:border-orange-500">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
                {index < adoptionSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-orange-300 z-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES LIST */}
      <section className="px-6 lg:px-16 py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Adoption Services Include</h2>
              <p className="text-slate-300 text-lg mb-8">
                Each pet is carefully cared for and supported to ensure a healthy and happy transition 
                into their new home. We provide comprehensive support throughout the adoption journey.
              </p>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 group hover:translate-x-2 transition-transform"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                      ✓
                    </div>
                    <p className="text-slate-200">{service}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform">
                <img src="/photo/cat.jpeg" alt="Adopted cat" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform mt-8">
                <img src="/photo/labrador-retriever.jpeg" alt="Adopted dog" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 lg:px-16 py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Change a Life?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Browse our available pets and find your perfect companion today
          </p>
          <Link
            to="/Signup"
            className="inline-block px-10 py-4 bg-white text-orange-500 rounded-full font-bold text-lg hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Start Your Adoption Journey
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
            © 2025 PetAdopt+. All rights reserved. | Making pet adoption easier and more transparent.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdoptionService;

