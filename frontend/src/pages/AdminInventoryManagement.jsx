import React, { useMemo, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

// Sample Inventory Data for Admin CRUD
const INITIAL_INVENTORY = [
  {
    id: 1,
    name: "Premium Dog Food",
    category: "Food",
    description: "High-protein kibble suitable for all dog breeds.",
    quantity: 40,
    price: 1200,
    status: "In Stock",
    image: "/photo/dog-food.jpg",
  },
  {
    id: 2,
    name: "Cat Scratching Post",
    category: "Accessories",
    description: "Durable scratching post for indoor cats.",
    quantity: 10,
    price: 1800,
    status: "In Stock",
    image: "/photo/cat-scratcher.jpg",
  },
  {
    id: 3,
    name: "Interactive Dog Toy",
    category: "Toy",
    description: "Chew‑resistant toy that keeps dogs engaged.",
    quantity: 0,
    price: 750,
    status: "Out of Stock",
    image: "/photo/dog-toy.jpg",
  },
  
];

const AdminInventoryManagement = () => {
  const [items, setItems] = useState(INITIAL_INVENTORY);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "Food",
    description: "",
    quantity: "",
    price: "",
    status: "In Stock",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState("");

  

  // Filters + search
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (!searchTerm.trim()) return true;
        return item.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .filter((item) => {
        if (categoryFilter === "all") return true;
        return item.category === categoryFilter;
      })
      .filter((item) => {
        if (statusFilter === "all") return true;
        return item.status === statusFilter;
      });
  }, [items, searchTerm, categoryFilter, statusFilter]);

  const openAddItemModal = () => {
    setEditingItem(null);
    setForm({
      name: "",
      category: "Food",
      description: "",
      quantity: "",
      price: "",
      status: "In Stock",
      image: "",
    });
    setImagePreview("");
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      status: item.status,
      image: item.image,
    });
    setImagePreview(item.image || "");
    setIsItemModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setForm((prev) => ({ ...prev, image: previewUrl }));
  };

  const handleSaveItem = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter at least Product Name.");
      return;
    }

    const quantity = Number(form.quantity) || 0;
    const price = Number(form.price) || 0;

    if (editingItem) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? {
                ...it,
                ...form,
                quantity,
                price,
              }
            : it
        )
      );
    } else {
      const newItem = {
        id: items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1,
        ...form,
        quantity,
        price,
      };
      setItems((prev) => [...prev, newItem]);
    }

    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  const confirmDeleteItem = (item) => {
    setDeleteTarget(item);
  };

  const handleDeleteItem = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((it) => it.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const closeModals = () => {
    setIsItemModalOpen(false);
    setEditingItem(null);
    setDeleteTarget(null);
  };

  return (
        <div className="min-h-screen bg-[#fff7f0] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar
          subtitle="Admin Inventory Management"
          title="Inventory Management"
        />

        <main className="flex-1 p-4 lg:p-8 space-y-4">
    
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Manage pet store inventory for food, toys & more.
              </h2>
            </div>

            {/* Filters + Add button */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search by product name..."
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
                <option value="Food">Food</option>
                <option value="Toy">Toy</option>
                <option value="Accessories">Accessories</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              <button
                onClick={openAddItemModal}
                className="inline-flex items-center gap-1 rounded-full bg-orange-500 text-white text-xs font-semibold px-4 py-2 hover:bg-orange-600 shadow-sm"
              >
                <span className="text-lg leading-none">+</span>
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Inventory table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Quantity</th>
                    <th className="px-4 py-3 text-left">Price (Rs)</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-slate-500"
                      >
                        No inventory items found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                              />
                            )}
                            <div>
                              <p className="font-medium text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {item.category}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          Rs {item.price}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              item.status === "In Stock"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => openEditItemModal(item)}
                              className="px-3 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDeleteItem(item)}
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
          </div>

          {/* Add/Edit Item modal */}
          {isItemModalOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 lg:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {editingItem ? "Edit Item" : "Add New Item"}
                  </h3>
                  <button
                    onClick={closeModals}
                    className="text-slate-400 hover:text-slate-600 text-lg"
                  >
                    ×
                  </button>
                </div>

                <form
                  onSubmit={handleSaveItem}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"
                >
                  <div className="space-y-2">
                    <div>
                      <label className="block mb-1 text-slate-600">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">
                        Category
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleFormChange}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option>Food</option>
                        <option>Toy</option>
                        <option>Accessories</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block mb-1 text-slate-600">
                          Quantity Available
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={form.quantity}
                          onChange={handleFormChange}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-600">
                          Price (Rs)
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={form.price}
                          onChange={handleFormChange}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">
                        Status
                      </label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleFormChange}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option>In Stock</option>
                        <option>Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block mb-1 text-slate-600">
                        Description
                      </label>
                      <textarea
                        name="description"
                        rows={4}
                        value={form.description}
                        onChange={handleFormChange}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">
                        Product Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-[11px] text-slate-600 file:mr-2 file:py-1.5 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                      />
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mt-2 w-24 h-24 rounded-xl object-cover border border-slate-100"
                        />
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-4 py-2 rounded-full border border-slate-200 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600"
                    >
                      {editingItem ? "Save Changes" : "Add Item"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete confirmation */}
          {deleteTarget && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Delete Inventory Item
                </h3>
                <p className="text-xs text-slate-600 mb-4">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{deleteTarget.name}</span>?
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteItem}
                    className="px-4 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
                  >
                    Delete
                  </button>
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