import React, { useMemo, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";


// Sample Pets Data for Admin CRUD
const INITIAL_PETS = [
  {
    id: 1,
    name: "Bruno",
    type: "Dog",
    breed: "Golden Retriever",
    age: "2 Months",
    gender: "Male",
    status: "Available",
    description: "Friendly and playful golden retriever puppy.",
    image: "/photo/golden-retriever.avif",
  },
  {
    id: 2,
    name: "Lussy",
    type: "Dog",
    breed: "Labrador Retriever",
    age: "5 Months",
    gender: "Female",
    status: "Available",
    description: "Energetic labrador who loves outdoor activities.",
    image: "/photo/labrador-retriever.avif",
  },
  {
    id: 3,
    name: "Coco",
    type: "Dog",
    breed: "Pug",
    age: "1 Month",
    gender: "Male",
    status: "Unavailable",
    description: "Calm pug, already reserved for adoption.",
    image: "/photo/pug.avif",
  },
  {
    id: 4,
    name: "Kiwi",
    type: "Cat",
    breed: "Abyssinian",
    age: "6 Months",
    gender: "Male",
    status: "Available",
    description: "Curious cat who loves to explore.",
    image: "/photo/abyssinian.avif",
  },
];

const AdminPetsManagement = () => {
  const [pets, setPets] = useState(INITIAL_PETS);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    name: "",
    type: "Dog",
    breed: "",
    age: "",
    gender: "Male",
    status: "Available",
    description: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState("");

  const filteredPets = useMemo(() => {
    if (filterStatus === "available") {
      return pets.filter((p) => p.status === "Available");
    }
    if (filterStatus === "unavailable") {
      return pets.filter((p) => p.status === "Unavailable");
    }
    return pets;
  }, [pets, filterStatus]);

  const openAddPetModal = () => {
    setEditingPet(null);
    setForm({
      name: "",
      type: "Dog",
      breed: "",
      age: "",
      gender: "Male",
      status: "Available",
      description: "",
      image: "",
    });
    setImagePreview("");
    setIsPetModalOpen(true);
  };

  const openEditPetModal = (pet) => {
    setEditingPet(pet);
    setForm({
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      status: pet.status,
      description: pet.description,
      image: pet.image,
    });
    setImagePreview(pet.image || "");
    setIsPetModalOpen(true);
  };

  const handlePetFormChange = (e) => {
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

  const handleSavePet = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.breed.trim()) {
      alert("Please fill in at least Name and Breed.");
      return;
    }

    if (editingPet) {
      setPets((prev) =>
        prev.map((p) =>
          p.id === editingPet.id
            ? {
              ...p,
              ...form,
            }
            : p
        )
      );
    } else {
      const newPet = {
        id: pets.length ? Math.max(...pets.map((p) => p.id)) + 1 : 1,
        ...form,
      };
      setPets((prev) => [...prev, newPet]);
    }

    setIsPetModalOpen(false);
    setEditingPet(null);
  };

  const confirmDeletePet = (pet) => {
    setDeleteTarget(pet);
  };

  const handleDeletePet = () => {
    if (!deleteTarget) return;
    setPets((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const closeModals = () => {
    setIsPetModalOpen(false);
    setEditingPet(null);
    setDeleteTarget(null);
  };

  

  return (
        <div className="min-h-screen bg-[#fff7f0] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar
          subtitle="Admin Pets Management"
          title="Pets Management"
        />

        <main className="flex-1 p-4 lg:p-8 space-y-4">
    
             
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Manage available pets for adoption and hostel.
              </h2>
              
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-200 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">Show All Pets</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>

              <button
                onClick={openAddPetModal}
                className="inline-flex items-center gap-1 rounded-full bg-orange-500 text-white text-xs font-semibold px-4 py-2 hover:bg-orange-600 shadow-sm"
              >
                <span className="text-lg leading-none">+</span>
                <span>Add Pet</span>
              </button>
            </div>
          </div>

          {/* Pets table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Pet</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Breed</th>
                    <th className="px-4 py-3 text-left">Age</th>
                    <th className="px-4 py-3 text-left">Gender</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-slate-500"
                      >
                        No pets found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPets.map((pet) => (
                      <tr
                        key={pet.id}
                        className="border-t border-slate-100 hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={pet.image}
                              alt={pet.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                            />
                            <div>
                              <p className="font-medium text-slate-900">
                                {pet.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {pet.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {pet.type}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {pet.breed}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {pet.age}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {pet.gender}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${pet.status === "Available"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {pet.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => openEditPetModal(pet)}
                              className="px-3 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDeletePet(pet)}
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

          {/* Add/Edit pet modal */}
          {isPetModalOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 lg:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {editingPet ? "Edit Pet" : "Add New Pet"}
                  </h3>
                  <button
                    onClick={closeModals}
                    className="text-slate-400 hover:text-slate-600 text-lg"
                  >
                    ×
                  </button>
                </div>

                <form
                  onSubmit={handleSavePet}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"
                >
                  <div className="space-y-2">
                    <div>
                      <label className="block mb-1 text-slate-600">
                        Pet Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handlePetFormChange}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">
                        Type
                      </label>
                      <select
                        name="type"
                        value={form.type}
                        onChange={handlePetFormChange}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option>Dog</option>
                        <option>Cat</option>
                        <option>Rabbit</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">
                        Breed *
                      </label>
                      <input
                        type="text"
                        name="breed"
                        value={form.breed}
                        onChange={handlePetFormChange}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block mb-1 text-slate-600">
                          Age
                        </label>
                        <input
                          type="text"
                          name="age"
                          value={form.age}
                          onChange={handlePetFormChange}
                          placeholder="e.g. 2 Months"
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-600">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={form.gender}
                          onChange={handlePetFormChange}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">
                        Status
                      </label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handlePetFormChange}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option>Available</option>
                        <option>Unavailable</option>
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
                        onChange={handlePetFormChange}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">
                        Pet Image
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
                      {editingPet ? "Save Changes" : "Add Pet"}
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
                  Delete Pet
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
                    onClick={handleDeletePet}
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

export default AdminPetsManagement;