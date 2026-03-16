import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPetTypes, setSelectedPetTypes] = useState([]);
  const [priceRange, setPriceRange] = useState("");
  const [cart, setCart] = useState([]);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [user, setUser] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('petshop_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('petshop_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/products');
      const data = await response.json();

      if (data.success) {
        // Show available and out of stock products (exclude manually unavailable)
        const visibleProducts = data.data.filter(p => p.status === 'Available' || p.status === 'Out of Stock');
        setProducts(visibleProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Toy', 'Food', 'Accessory'];
  const petTypes = ['Dog', 'Cat', 'Rabbit', 'All'];

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const togglePetType = (type) => {
    setSelectedPetTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedPetTypes([]);
    setPriceRange("");
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const term = search.trim().toLowerCase();
      if (term && !(
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        (product.brand && product.brand.toLowerCase().includes(term))
      )) {
        return false;
      }

      // Category filter
      if (selectedCategories.length && !selectedCategories.includes(product.category)) {
        return false;
      }

      // Pet type filter
      if (selectedPetTypes.length && !selectedPetTypes.includes(product.petType)) {
        return false;
      }

      // Price range filter
      if (priceRange) {
        const price = product.price;
        if (priceRange === "0-500" && !(price <= 500)) return false;
        if (priceRange === "501-1000" && !(price >= 501 && price <= 1000)) return false;
        if (priceRange === "1001-2000" && !(price >= 1001 && price <= 2000)) return false;
        if (priceRange === "2000+" && !(price > 2000)) return false;
      }

      return true;
    });
  }, [search, selectedCategories, selectedPetTypes, priceRange, products]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        // Check if we can add more
        if (existing.quantity >= product.stock) {
          alert(`Only ${product.stock} items available in stock`);
          return prev;
        }
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setShowCartPreview(true);
    setTimeout(() => setShowCartPreview(false), 2000);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#fff7f0] flex flex-col">
      {/* NAVBAR */}
      <UserNavbar />

      {/* Cart Preview Toast */}
      {showCartPreview && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span className="font-semibold">Added to cart!</span>
          </div>
        </div>
      )}

      {/* SEARCH BAR */}
      <section className="px-6 lg:px-16 pt-4 pb-2 bg-[#fff7f0]">
        <div className="max-w-xl w-full bg-white border border-orange-100 rounded-full px-4 py-2 flex items-center shadow-sm">
          <span className="text-slate-400 mr-2">🔍</span>
          <input
            type="text"
            className="w-full border-none outline-none text-sm bg-transparent placeholder:text-slate-400"
            placeholder="Search for a product by name or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="flex-1 px-6 lg:px-16 py-4 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 items-start">
          {/* FILTERS */}
          <aside className="md:col-span-1 bg-[#fffaf4] border border-orange-100 rounded-2xl p-4 shadow-sm md:sticky md:top-28 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
              <button
                onClick={resetFilters}
                className="text-xs text-orange-500 hover:text-orange-600 cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Category */}
            <div className="pt-3 border-t border-orange-100">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-2">
                Category
              </p>
              {categories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 text-sm text-slate-700 mb-1.5"
                >
                  <input
                    type="checkbox"
                    className="rounded border-orange-200 text-orange-500 focus:ring-orange-400"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>

            {/* Pet Type */}
            <div className="pt-3 border-t border-orange-100">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-2">
                Pet Type
              </p>
              {petTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-sm text-slate-700 mb-1.5"
                >
                  <input
                    type="checkbox"
                    className="rounded border-orange-200 text-orange-500 focus:ring-orange-400"
                    checked={selectedPetTypes.includes(type)}
                    onChange={() => togglePetType(type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

            {/* Price Range */}
            <div className="pt-3 border-t border-orange-100">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-2">
                Price Range
              </p>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full text-sm border border-orange-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                <option value="">All Prices</option>
                <option value="0-500">Rs 0 - 500</option>
                <option value="501-1000">Rs 501 - 1000</option>
                <option value="1001-2000">Rs 1001 - 2000</option>
                <option value="2000+">Rs 2000+</option>
              </select>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <main className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Pet Shop
              </h2>
              <span className="text-xs text-slate-500">
                {filteredProducts.length} found
              </span>
            </div>

            {loading ? (
              <div className="border border-orange-200 rounded-xl bg-white p-6 text-center text-sm text-slate-500">
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="border border-dashed border-orange-200 rounded-xl bg-white p-6 text-center text-sm text-slate-500">
                <p>No products match the selected filters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-3 inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-orange-400 text-orange-500 text-xs hover:bg-orange-50 cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {filteredProducts.map((product) => (
                  <article
                    key={product._id}
                    className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm flex flex-col"
                  >
                    <Link to={`/product/${product._id}`} className="block">
                      <div className="relative pt-[70%] overflow-hidden">
                        <img
                          src={product.image || '/placeholder.png'}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                        />
                        <span className="absolute top-2 left-2 bg-orange-50 border border-orange-300 text-[11px] text-orange-600 px-2 py-0.5 rounded-full">
                          {product.category}
                        </span>
                        {product.status === 'Out of Stock' ? (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold">
                            Out of Stock
                          </span>
                        ) : product.isLowStock && (
                          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold">
                            Low Stock
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="p-3.5 flex flex-col gap-1.5 text-xs text-slate-600">
                      <Link to={`/product/${product._id}`}>
                        <h3 className="text-sm font-semibold text-slate-900 hover:text-orange-500">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="flex justify-between gap-2">
                        <span>For {product.petType}</span>
                        {product.brand && <span>{product.brand}</span>}
                      </p>
                      <p className="flex justify-between gap-2">
                        <span className="text-orange-500 font-bold text-base">Rs {product.price}</span>
                        <span className={product.status === 'Out of Stock' ? 'text-red-600 font-medium' : ''}>
                          {product.status === 'Out of Stock' ? 'Out of Stock' : `${product.stock} in stock`}
                        </span>
                      </p>
                      <div className="pt-1 flex justify-between items-center">
                        <Link
                          to={`/product/${product._id}`}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-slate-800 text-[11px] font-medium text-slate-900 hover:bg-slate-900 hover:text-white"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                          }}
                          disabled={product.status === 'Out of Stock'}
                          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[11px] font-medium ${
                            product.status === 'Out of Stock'
                              ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                              : 'bg-orange-500 text-white hover:bg-orange-600 cursor-pointer'
                          }`}
                        >
                          {product.status === 'Out of Stock' ? 'Unavailable' : '🛒 Add'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;

