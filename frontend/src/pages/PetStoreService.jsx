import React from "react";
import { Link } from "react-router-dom";

const PetStoreService = () => {
  const categories = [
    {
      icon: "🍖",
      title: "Premium Food",
      description: "Nutritious meals for healthy, happy pets",
      items: ["Dry Food", "Wet Food"]
    },
    {
      icon: "🎾",
      title: "Toys & Play",
      description: "Fun and engaging toys for active pets",
      items: ["Chew Toys", "Interactive Toys", "Balls"]
    },
    {
      icon: "🦴",
      title: "Accessories",
      description: "Essential items for daily pet care",
      items: ["Bowls", "Beds"]
    },
    {
      icon: "✨",
      title: "Grooming",
      description: "Keep your pet clean and stylish",
      items: ["Shampoos", "Brushes","Grooming Tools"]
    }
  ];

  const benefits = [
    "High-quality products from trusted brands",
    "Eco-friendly and sustainable product options",
    "Fast and reliable home delivery service",
    "Easy returns and quality guarantee",
    "Products suitable for all pet types and ages",
   
  ];

  const featuredProducts = [
    {
      name: "Premium Dog Food",
      category: "Food",
      image: "/photo/dogfood.avif",
      badge: "Best Seller"
    },
    {
      name: "Premium Cat Food",
      category: "Food",
      image: "/photo/catfood.jpg.avif",
      badge: "New Arrival"
    },
    {
      name: "Comfort Pet Bed",
      category: "Accessory",
      image: "/photo/bed.jpg",
      badge: "Premium"
    }
  ];

  const petTypes = [
    { name: "Dogs", icon: "🐕", count: "150+ Products" },
    { name: "Cats", icon: "🐈", count: "120+ Products" },
    { name: "Rabbits", icon: "🐰", count: "80+ Products" },
    { name: "All Pets", icon: "🐾", count: "350+ Products" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-20 bg-white border-b border-green-100/80 px-6 lg:px-16 py-4 flex items-center justify-between shadow-sm">
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
          <Link to="/hostel-service" className="hover:text-orange-500 transition-colors">Pet Hostel</Link>
          <Link to="/store-service" className="text-orange-500 font-semibold">Pet Store</Link>
        </nav>

      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 lg:px-16 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-100 via-green-50 to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm font-semibold">
                🛒 Pet Store Service
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Quality Products for
                <span className="text-orange-500"> Happy Pets</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Our pet store delivers high-quality and essential products designed to support your pet's 
                health, comfort, and happiness. From nutrition to accessories, we focus on reliable, 
                pet-friendly products that meet everyday needs and promote a better lifestyle for your furry companions.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/Signup"
                  className="px-8 py-4 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Browse Products
                </Link>
                
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <img
                  src="/photo/dog.webp"
                  alt="Happy pet with products"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="text-4xl font-bold text-orange-500">350+</div>
                <div className="text-sm text-slate-600">Quality Products</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PET TYPES */}
      <section className="px-6 lg:px-16 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Shop by Pet Type</h2>
            <p className="text-lg text-slate-600">Find products tailored for your pet's needs</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {petTypes.map((pet, index) => (
              <Link
                key={index}
                
                className="group bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100 text-center"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {pet.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{pet.name}</h3>
                <p className="text-orange-500 font-semibold">{pet.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="px-6 lg:px-16 py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Product Categories</h2>
            <p className="text-lg text-slate-600">Everything your pet needs in one place</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-orange-500"
              >
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform shadow-lg">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{category.title}</h3>
                <p className="text-slate-600 mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-orange-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="px-6 lg:px-16 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Featured Products</h2>
            <p className="text-lg text-slate-600">Our most popular items loved by pets and owners</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-orange-500"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {product.badge}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-sm text-slate-500 mb-2">{product.category}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-orange-500">{product.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="px-6 lg:px-16 py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Why Shop With Us?</h2>
              <p className="text-slate-300 text-lg mb-8">
                We carefully curate our product selection to ensure your pets get only the best. 
                From nutrition to comfort, every product is chosen with your pet's wellbeing in mind.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 group hover:translate-x-2 transition-transform bg-slate-800 p-4 rounded-xl"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                      ✓
                    </div>
                    <p className="text-slate-200 text-sm">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform">
                <img src="/photo/cat.jpeg" alt="Pet products" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform mt-8">
                <img src="/photo/labrador-retriever.jpeg" alt="Happy pet" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform -mt-8">
                <img src="/photo/dog.webp" alt="Pet care" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform">
                <img src="/photo/cat.jpeg" alt="Pet accessories" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DELIVERY INFO */}
      <section className="px-6 lg:px-16 py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Fast & Reliable Delivery</h2>
            <p className="text-lg text-slate-600">Get your pet products delivered right to your doorstep</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                🚚
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Free Shipping</h3>
              <p className="text-slate-600">On orders above ₹10000</p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Fast Delivery</h3>
              <p className="text-slate-600">2-3 days delivery nationwide</p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                💯
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Quality Guarantee</h3>
              <p className="text-slate-600">100% satisfaction or money back</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 lg:px-16 py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Everything Your Pet Needs
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Explore our wide range of quality products and give your pet the best
          </p>
          <Link
            to="/Signup"
            className="inline-block px-10 py-4 bg-white text-orange-500 rounded-full font-bold text-lg hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Start Shopping Now
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
            © 2025 PetAdopt+. All rights reserved. | Quality products for happy pets.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PetStoreService;

