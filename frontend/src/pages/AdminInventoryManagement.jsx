import React, { useMemo, useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

const AdminInventoryManagement = () => {
  // State for products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products"); // products or orders
  
  // Product states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [petTypeFilter, setPetTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Orders states
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    category: "Toy",
    petType: "All",
    description: "",
    price: "",
    stock: "",
    lowStockThreshold: "10",
    status: "Available",
    brand: "",
    weight: "",
    image: "",
    discount: "0",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return productForm.image;

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      setUploading(true);
      const response = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        return data.url;
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Image upload service is not available. Saving product without image. Please configure Cloudinary to enable image uploads.`);
      return '';
    } finally {
      setUploading(false);
    }
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!searchTerm.trim()) return true;
        return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               p.description.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .filter((p) => categoryFilter === "all" || p.category === categoryFilter)
      .filter((p) => petTypeFilter === "all" || p.petType === petTypeFilter)
      .filter((p) => statusFilter === "all" || p.status === statusFilter);
  }, [products, searchTerm, categoryFilter, petTypeFilter, statusFilter]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === "all") return orders;
    return orders.filter(o => o.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.isLowStock || (p.stock <= p.lowStockThreshold && p.stock > 0));
  }, [products]);

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      category: "Toy",
      petType: "All",
      description: "",
      price: "",
      stock: "",
      lowStockThreshold: "10",
      status: "Available",
      brand: "",
      weight: "",
      image: "",
      discount: "0",
    });
    setImagePreview("");
    setImageFile(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      petType: product.petType,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      lowStockThreshold: product.lowStockThreshold?.toString() || "10",
      status: product.status,
      brand: product.brand || "",
      weight: product.weight || "",
      image: product.image || "",
      discount: (product.discount ?? 0).toString(),
    });
    setImagePreview(product.image || "");
    setImageFile(null);
    setIsProductModalOpen(true);
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!productForm.name.trim()) {
      alert("Please enter product name");
      return;
    }

    try {
      setUploading(true);
      
      // Upload image if new file selected
      let imageUrl = productForm.image;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const productData = {
        name: productForm.name,
        category: productForm.category,
        petType: productForm.petType,
        description: productForm.description,
        price: Number(productForm.price) || 0,
        stock: Number(productForm.stock) || 0,
        lowStockThreshold: Number(productForm.lowStockThreshold) || 10,
        status: productForm.status,
        brand: productForm.brand,
        weight: productForm.weight,
        image: imageUrl,
        discount: Number(productForm.discount) || 0,
      };

      const url = editingProduct
        ? `http://localhost:4000/api/products/${editingProduct._id}`
        : 'http://localhost:4000/api/products';

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchProducts();
        setIsProductModalOpen(false);
        setEditingProduct(null);
      } else {
        alert(data.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setUploading(false);
    }
  };

  const confirmDeleteProduct = (product) => {
    setDeleteTarget(product);
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:4000/api/products/${deleteTarget._id}`,
        { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchProducts();
    setDeleteTarget(null);
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, newPaymentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the selected order in state
        setSelectedOrder(data.data);
        
        // Refresh orders list
        fetchOrders();
        
        // Show success message with email confirmation
        const statusMsg = newStatus !== selectedOrder.status 
          ? `Order status updated to "${newStatus}"`
          : `Payment status updated to "${newPaymentStatus}"`;
        
        alert(`${statusMsg}\n\n✅ Email notification sent to customer!`);
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const closeModals = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setDeleteTarget(null);
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };

  return (
        <div className="min-h-screen bg-[#fff7f0] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar
          subtitle="Admin Inventory Management"
          title="Inventory & Orders"
        />

        <main className="flex-1 p-4 lg:p-8 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === "products"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === "orders"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Orders ({orders.length})
            </button>
          </div>

          {/* Low Stock Alert */}
          {activeTab === "products" && lowStockProducts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 text-sm">
                    Low Stock Alert
                  </h3>
                  <p className="text-xs text-amber-700 mt-1">
                    {lowStockProducts.length} product(s) are running low on stock
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {lowStockProducts.map(p => (
                      <span key={p._id} className="text-xs bg-white px-2 py-1 rounded-full border border-amber-200">
                        {p.name} ({p.stock} left)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Manage Products - Food, Toys & Accessories
                </h2>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                    placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-slate-200 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-slate-200 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">All Categories</option>
                    <option value="Toy">Toy</option>
                <option value="Food">Food</option>
                    <option value="Accessory">Accessory</option>
                  </select>

                  <select
                    value={petTypeFilter}
                    onChange={(e) => setPetTypeFilter(e.target.value)}
                    className="border border-slate-200 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="all">All Pets</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="All">All Pets</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              <button
                    onClick={openAddProductModal}
                className="inline-flex items-center gap-1 rounded-full bg-orange-500 text-white text-xs font-semibold px-4 py-2 hover:bg-orange-600 shadow-sm"
              >
                <span className="text-lg leading-none">+</span>
                    <span>Add Product</span>
              </button>
            </div>
          </div>

              {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center text-slate-500">Loading products...</div>
                ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Category</th>
                          <th className="px-4 py-3 text-left">Pet Type</th>
                          <th className="px-4 py-3 text-left">Stock</th>
                    <th className="px-4 py-3 text-left">Price (Rs)</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                              No products found
                      </td>
                    </tr>
                  ) : (
                          filteredProducts.map((product) => (
                      <tr
                              key={product._id}
                        className="border-t border-slate-100 hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                                  {product.image && (
                              <img
                                      src={product.image}
                                      alt={product.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                              />
                            )}
                            <div>
                              <p className="font-medium text-slate-900">
                                      {product.name}
                              </p>
                                    {product.brand && (
                              <p className="text-[11px] text-slate-500">
                                        {product.brand}
                              </p>
                                    )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                                {product.category}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                                {product.petType}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`font-medium ${
                                  product.stock === 0 ? 'text-red-600' :
                                  product.isLowStock ? 'text-amber-600' :
                                  'text-slate-700'
                                }`}>
                                  {product.stock}
                                  {product.isLowStock && product.stock > 0 && (
                                    <span className="ml-1 text-amber-600">⚠️</span>
                                  )}
                                </span>
                        </td>
                        <td className="px-4 py-3">
                          {product.discount > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] text-slate-400 line-through">Rs {product.price}</span>
                              <span className="text-sm font-semibold text-red-600">
                                Rs {Math.round(product.price * (1 - product.discount / 100))}
                              </span>
                              <span className="inline-block text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold w-fit">
                                {product.discount}% OFF
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-700">Rs {product.price}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                    product.status === "Available"
                                ? "bg-emerald-50 text-emerald-600"
                                      : product.status === "Out of Stock"
                                      ? "bg-red-50 text-red-600"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                                  {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                                    onClick={() => openEditProductModal(product)}
                              className="px-3 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                                    onClick={() => confirmDeleteProduct(product)}
                              className="px-3 py-1 rounded-full border border-red-200 text-[11px] text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
                )}
              </div>
            </>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Customer Orders Management
                </h2>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="border border-slate-200 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="all">All Orders</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>
          </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">Order #</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Items</th>
                        <th className="px-4 py-3 text-left">Total</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Payment</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr
                            key={order._id}
                            className="border-t border-slate-100 hover:bg-slate-50/60"
                          >
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {order.orderNumber}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-slate-900">
                                  {order.customer.name}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {order.customer.email}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {order.items.length} item(s)
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              Rs {order.totalAmount}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  order.status === "Delivered"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : order.status === "Cancelled"
                                    ? "bg-red-50 text-red-600"
                                    : order.status === "Returned"
                                    ? "bg-indigo-50 text-indigo-600"
                                    : order.status === "Shipped"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  order.paymentStatus === "Paid"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : order.paymentStatus === "Failed"
                                    ? "bg-red-50 text-red-600"
                                    : order.paymentStatus === "Refunded"
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsOrderModalOpen(true);
                                }}
                                className="px-3 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-100"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Add/Edit Product Modal */}
          {isProductModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 my-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <button
                    onClick={closeModals}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-3">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-slate-700">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                          value={productForm.name}
                          onChange={handleProductFormChange}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                      />
                    </div>

                      <div className="grid grid-cols-2 gap-3">
                    <div>
                          <label className="block mb-1 text-sm font-medium text-slate-700">
                            Category *
                      </label>
                      <select
                        name="category"
                            value={productForm.category}
                            onChange={handleProductFormChange}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                          >
                            <option value="Toy">Toy</option>
                            <option value="Food">Food</option>
                            <option value="Accessory">Accessory</option>
                      </select>
                    </div>

                      <div>
                          <label className="block mb-1 text-sm font-medium text-slate-700">
                            Pet Type *
                        </label>
                          <select
                            name="petType"
                            value={productForm.petType}
                            onChange={handleProductFormChange}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                          >
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                            <option value="Rabbit">Rabbit</option>
                            <option value="All">All Pets</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                      <div>
                          <label className="block mb-1 text-sm font-medium text-slate-700">
                            Price (Rs) *
                        </label>
                        <input
                          type="number"
                          name="price"
                            value={productForm.price}
                            onChange={handleProductFormChange}
                            min="0"
                            step="0.01"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-medium text-slate-700">
                            Stock Quantity *
                          </label>
                          <input
                            type="number"
                            name="stock"
                            value={productForm.stock}
                            onChange={handleProductFormChange}
                            min="0"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                      </div>
                      </div>

                      {/* Discount */}
                      <div>
                        <label className="block mb-1 text-sm font-medium text-slate-700">
                          Offer Discount
                        </label>
                        <select
                          name="discount"
                          value={productForm.discount}
                          onChange={handleProductFormChange}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="0">No Discount</option>
                          <option value="10">10% Off</option>
                          <option value="20">20% Off</option>
                          <option value="30">30% Off</option>
                          <option value="40">40% Off</option>
                          <option value="50">50% Off</option>
                        </select>
                        {Number(productForm.discount) > 0 && Number(productForm.price) > 0 && (
                          <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                            <span className="text-xs text-slate-500 line-through">Rs {Number(productForm.price)}</span>
                            <span className="text-sm font-bold text-red-600">
                              Rs {Math.round(Number(productForm.price) * (1 - Number(productForm.discount) / 100))}
                            </span>
                            <span className="ml-auto text-[11px] bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                              {productForm.discount}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-slate-700">
                            Brand
                          </label>
                          <input
                            type="text"
                            name="brand"
                            value={productForm.brand}
                            onChange={handleProductFormChange}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-medium text-slate-700">
                            Weight/Size
                          </label>
                          <input
                            type="text"
                            name="weight"
                            value={productForm.weight}
                            onChange={handleProductFormChange}
                            placeholder="e.g., 500g, 5kg"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-slate-700">
                            Low Stock Threshold
                          </label>
                          <input
                            type="number"
                            name="lowStockThreshold"
                            value={productForm.lowStockThreshold}
                            onChange={handleProductFormChange}
                            min="0"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Alert when stock falls below this number
                          </p>
                    </div>

                    <div>
                          <label className="block mb-1 text-sm font-medium text-slate-700">
                            Status *
                      </label>
                      <select
                        name="status"
                            value={productForm.status}
                            onChange={handleProductFormChange}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                          >
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                            {/* Only show "Out of Stock" option when editing an existing product */}
                            {editingProduct && <option value="Out of Stock">Out of Stock</option>}
                      </select>
                          <p className="text-xs text-slate-500 mt-1">
                            💡 <strong>Note:</strong> "Out of Stock" is set automatically when stock reaches 0
                          </p>
                        </div>
                      </div>
                  </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-slate-700">
                          Description *
                      </label>
                      <textarea
                        name="description"
                          rows={5}
                          value={productForm.description}
                          onChange={handleProductFormChange}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                      />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-slate-700">
                        Product Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                          onChange={handleImageSelect}
                          className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                      />
                      {imagePreview && (
                          <div className="mt-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                              className="w-full h-40 rounded-xl object-cover border border-slate-200"
                        />
                          </div>
                      )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-5 py-2 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Uploading...' : editingProduct ? 'Save Changes' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Product Confirmation */}
          {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Delete Product
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{deleteTarget.name}</span>?
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    className="px-5 py-2 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Details Modal */}
          {isOrderModalOpen && selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 my-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Order Details - {selectedOrder.orderNumber}
                  </h3>
                  <button
                    onClick={closeModals}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-slate-900 mb-2">Customer Information</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-slate-600">Name:</span> <span className="font-medium">{selectedOrder.customer.name}</span></p>
                      <p><span className="text-slate-600">Email:</span> {selectedOrder.customer.email}</p>
                      <p><span className="text-slate-600">Phone:</span> {selectedOrder.customer.phone}</p>
                      <p><span className="text-slate-600">Address:</span> {selectedOrder.customer.address}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm">
                          <div>
                            <p className="font-medium text-slate-900">{item.productName}</p>
                            <p className="text-xs text-slate-600">Qty: {item.quantity} × Rs {item.price}</p>
                          </div>
                          <p className="font-semibold text-slate-900">Rs {item.subtotal}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium text-slate-900">
                          Rs {selectedOrder.subtotal || selectedOrder.totalAmount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Shipping Fee</span>
                        <span className={`font-medium ${selectedOrder.shippingFee === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                          {selectedOrder.shippingFee === 0 ? 'FREE' : `Rs ${selectedOrder.shippingFee || 0}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="font-semibold text-slate-900">Total Amount</span>
                        <span className="text-lg font-bold text-orange-600">Rs {selectedOrder.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-slate-900 mb-3">Update Order Status</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-xs font-medium text-slate-700">
                          Order Status
                          {(selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Delivered' || selectedOrder.status === 'Returned') && (
                            <span className="ml-2 text-[10px] text-slate-500">(Locked)</span>
                          )}
                        </label>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value, selectedOrder.paymentStatus)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          disabled={selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Delivered' || selectedOrder.status === 'Returned'}
                          title={
                            selectedOrder.status === 'Cancelled'
                              ? 'Cancelled order status is locked and cannot be changed'
                              : selectedOrder.status === 'Delivered'
                              ? 'Delivered order status is locked and cannot be changed'
                              : selectedOrder.status === 'Returned'
                              ? 'Returned order status is locked and cannot be changed'
                              : ''
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Returned">Returned</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-xs font-medium text-slate-700">
                          Payment Status
                          {(selectedOrder.paymentStatus === 'Failed' || selectedOrder.paymentStatus === 'Refunded' || selectedOrder.paymentStatus === 'Unpaid') && (
                            <span className="ml-2 text-[10px] text-slate-500">(Locked)</span>
                          )}
                        </label>
                        <select
                          value={selectedOrder.paymentStatus}
                          onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, selectedOrder.status, e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                          disabled={selectedOrder.paymentStatus === 'Failed' || selectedOrder.paymentStatus === 'Refunded' || selectedOrder.paymentStatus === 'Unpaid'}
                          title={
                            selectedOrder.paymentStatus === 'Failed' 
                              ? 'Failed payment status is locked and cannot be changed'
                              : selectedOrder.paymentStatus === 'Refunded'
                              ? 'Refunded payment status is locked and cannot be changed'
                              : selectedOrder.paymentStatus === 'Unpaid'
                              ? 'Unpaid payment status is locked for cancelled orders'
                              : ''
                          }
                        >
                          {/* Pending can change to any status */}
                          {selectedOrder.paymentStatus === 'Pending' && (
                            <>
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                              <option value="Failed">Failed (Auto-cancels order)</option>
                              <option value="Refunded">Refunded (Auto-returns order)</option>
                            </>
                          )}
                          
                          {/* Paid can only change to Refunded */}
                          {selectedOrder.paymentStatus === 'Paid' && (
                            <>
                              <option value="Paid">Paid</option>
                              <option value="Refunded">Refunded (Auto-returns order)</option>
                            </>
                          )}
                          
                          {/* Failed is locked */}
                          {selectedOrder.paymentStatus === 'Failed' && (
                            <option value="Failed">Failed (Locked)</option>
                          )}
                          
                          {/* Refunded is locked */}
                          {selectedOrder.paymentStatus === 'Refunded' && (
                            <option value="Refunded">Refunded (Locked)</option>
                          )}
                          
                          {/* Unpaid is locked (auto-set for cancelled orders) */}
                          {selectedOrder.paymentStatus === 'Unpaid' && (
                            <option value="Unpaid">Unpaid (Locked)</option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-4 border-t border-slate-200">
                    <button
                      onClick={closeModals}
                      className="px-5 py-2 rounded-full bg-slate-100 text-sm text-slate-700 hover:bg-slate-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminInventoryManagement;
