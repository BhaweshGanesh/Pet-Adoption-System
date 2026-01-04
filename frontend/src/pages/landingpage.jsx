import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [hoveredImage, setHoveredImage] = useState(null);

  const petImages = [
    { id: 1, src: '/photo/catt.avif', alt: 'Cat', name: 'Fluffy' },
    { id: 2, src: '/photo/cat2.avif', alt: 'Cat 2', name: 'Whiskers' },
    { id: 3, src: '/photo/pug.avif', alt: 'Pug', name: 'Puggy' },
    { id: 4, src: '/photo/husky.avif', alt: 'Husky', name: 'Luna' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <span className="text-2xl font-bold">
              Pet<span className="text-orange-500">Adopt+</span>
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-900 font-medium hover:text-orange-500 transition-colors">
              Home
            </a>
            <a href="#services" className="text-gray-900 font-medium hover:text-orange-500 transition-colors">
              Services
            </a>
            <a href="#about" className="text-gray-900 font-medium hover:text-orange-500 transition-colors">
              About us
            </a>
            <Link to="/login" className="text-gray-900 font-medium hover:text-orange-500 transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="px-6 py-2 border-2 border-gray-900 rounded-full font-medium hover:bg-gray-900 hover:text-white transition-all">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Taking <span className="inline-block">🐕</span> Care
                <br />
                of Your Little
                <br />
                Pets <span className="inline-block">✨</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our highly skilled professional associates love pets as much as you do,
                and we offer a wide range of pet services.
              </p>
              <button className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Get Started
              </button>
            </div>

            {/* Right Content -  Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-8 shadow-2xl overflow-hidden group">
                <div className="aspect-[4/3] bg-white rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Hero Image */}
                  <img 
                    src="/photo/bbb.jpg" 
                     
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600">
              Everything your pet needs, all in one place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8" id="services">
            {/* Service Card 1 */}
            <Link to="/adoption-service" className="bg-orange-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🏠</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Adoption</h3>
              <p className="text-gray-600">Find your perfect companion from our shelter</p>
            </Link>

            {/* Service Card 2 */}
            <Link to="/hostel-service" className="bg-orange-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🏨</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Pet Hostel</h3>
              <p className="text-gray-600">Safe, comfortable, and caring accommodation for your pets while you're away</p>
            </Link>

            {/* Service Card 3 */}
            <Link to="/store-service" className="bg-orange-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🛒</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Pet Store</h3>
              <p className="text-gray-600">Wide range of quality pet products delivered to your doorstep</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Friends
            </h2>
            <p className="text-lg text-gray-600">
              Adorable pets waiting to meet you
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {petImages.map((image) => (
              <div
                key={image.id}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredImage(image.id)}
                onMouseLeave={() => setHoveredImage(null)}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2">
                  {/* Pet Image */}
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img 
                      src={image.src} 
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-orange-500 to-transparent transition-opacity duration-300 ${
                      hoveredImage === image.id ? 'opacity-70' : 'opacity-0'
                    }`}>
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-xl font-bold mb-1">{image.name}</h3>
                        <p className="text-sm opacity-90">Click to learn more</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Section with Featured Pets */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Pet Images */}
            <div className="relative flex items-end justify-start space-x-6">
              {/* Featured Pet 1 - Cat */}
              <div className="relative group cursor-pointer transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-56 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <img 
                    src="/photo/cutecat.avif" 
                    alt="Featured Cat"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Featured Pet 2 - Dog */}
              <div className="relative group cursor-pointer transform hover:-translate-y-2 transition-all duration-300 mt-12">
                <div className="w-56 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <img 
                    src="/photo/dog4.jpeg" 
                    alt="Featured Dog"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </div>  

              
            </div>

            {/* Right Side - Text Content */}
            <div className="text-white space-y-5">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-2">
                  Welcome To
                </h2>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Pet<span className="text-orange-500">Adopt+</span>
                </h2>
              </div>
              
              <div className="w-16 h-1 bg-orange-500 rounded-full"></div>
              
              <p className="text-gray-300 text-base leading-relaxed">
                Pet Adopt+ offers a complete range of services for your beloved pets. From providing loving adoption services to help furry friends find their forever homes, to a safe and comfortable pet hotel for boarding, and a fully stocked pet shop with quality food, toys, and supplies, we are dedicated to the health, happiness, and well-being of every pet. Our team is committed to giving personalized care, and we offer free consultations and guidance to ensure your pets get the best possible care and attention.
              </p>
              
              <button className="mt-4 px-7 py-2.5 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🐾</span>
                </div>
                <span className="text-xl font-bold">
                  Pet<span className="text-orange-500">Adopt+</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Taking care of your little pets with love and dedication.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">About Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Adoption</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Pet Hostel</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Pet Store</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: info@petadopt.com</li>
                <li>Phone: (123) 456-7890</li>
                <li>Address: Kathmandu</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 PetAdopt+. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;