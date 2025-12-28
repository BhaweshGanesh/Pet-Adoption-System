import React, { useMemo, useState } from "react";
import { useEffect } from 'react';
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";




const AdminPetsManagement = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    size: "Medium",
    vaccinated: false,
    vaccinations: [
      { name: 'Rabies', status: 'pending', date: '', nextDue: '' },
      { name: 'DHPP', status: 'pending', date: '', nextDue: '' },
      { name: 'Parvovirus', status: 'pending', date: '', nextDue: '' },
      { name: 'Bordetella', status: 'pending', date: '', nextDue: '' }
    ],
    inShelter: "",
  });
  useEffect(() => {
    fetchPets();
  }, []);
  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/pets');
      const data = await response.json();
      if (data.success) {
        setPets(data.data);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      alert('Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/pets/${deleteTarget._id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchPets(); // Refresh the list
        setDeleteTarget(null);
      } else {
        alert(data.message || 'Failed to delete pet');
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
      alert('Failed to delete pet');
    }
  };
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const filteredPets = useMemo(() => {
    if (filterStatus === "available") {
      return pets.filter((p) => p.status === "Available");
    }
    if (filterStatus === "booked") {
      return pets.filter((p) => p.status === "Booked");
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
      size: "Medium",
      vaccinated: false,
      vaccinations: [
        { name: 'Rabies', status: 'pending', date: '', nextDue: '' },
        { name: 'DHPP', status: 'pending', date: '', nextDue: '' },
        { name: 'Parvovirus', status: 'pending', date: '', nextDue: '' },
        { name: 'Bordetella', status: 'pending', date: '', nextDue: '' }
      ],
      inShelter: "",
    });
    setImagePreview("");
    setImageFile(null);
    setIsPetModalOpen(true);
  };

  const openEditPetModal = (pet) => {
    setEditingPet(pet);
    const defaultVaccinations = [
      { name: 'Rabies', status: 'pending', date: '', nextDue: '' },
      { name: 'DHPP', status: 'pending', date: '', nextDue: '' },
      { name: 'Parvovirus', status: 'pending', date: '', nextDue: '' },
      { name: 'Bordetella', status: 'pending', date: '', nextDue: '' }
    ];
    setForm({
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      status: pet.status,
      description: pet.description,
      image: pet.image,
      size: pet.size || "Medium",
      vaccinated: pet.vaccinated !== undefined ? pet.vaccinated : false,
      vaccinations: pet.vaccinations && pet.vaccinations.length > 0 
        ? pet.vaccinations.map(v => ({
            ...v,
            date: v.date ? new Date(v.date).toISOString().split('T')[0] : '',
            nextDue: v.nextDue ? new Date(v.nextDue).toISOString().split('T')[0] : ''
          }))
        : defaultVaccinations,
      inShelter: pet.inShelter || "",
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
    setImageFile(file); // Store the actual file for upload
  };

  const handleVaccinationChange = (index, field, value) => {
    setForm((prev) => {
      const updatedVaccinations = [...prev.vaccinations];
      updatedVaccinations[index] = {
        ...updatedVaccinations[index],
        [field]: value
      };
      return { ...prev, vaccinations: updatedVaccinations };
    });
  };

  const handleSavePet = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.breed.trim()) {
      alert("Please fill in at least Name and Breed.");
      return;
    }

    // Check if vaccinated checkbox is ticked and at least one vaccine is completed
    const anyVaccineCompleted = form.vaccinations.some(v => v.status === 'completed');
    const isVaccinated = form.vaccinated && anyVaccineCompleted;

    if (form.vaccinated && !anyVaccineCompleted) {
      alert("Please mark at least one vaccine as completed to set the pet as vaccinated, or uncheck the vaccinated box.");
      return;
    }

    try {
      setUploading(true);
      let imageUrl = form.image;

      // Upload image to Cloudinary if a new file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResponse = await fetch('http://localhost:4000/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (uploadData.success) {
          imageUrl = uploadData.url;
        } else {
          alert('Failed to upload image: ' + uploadData.message);
          setUploading(false);
          return;
        }
      }

      // Save pet with the Cloudinary image URL
      const url = editingPet
        ? `http://localhost:4000/api/pets/${editingPet._id}`
        : 'http://localhost:4000/api/pets';
      
      const method = editingPet ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...form, image: imageUrl, vaccinated: isVaccinated }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchPets(); // Refresh the list
        setIsPetModalOpen(false);
        setEditingPet(null);
        setImageFile(null);
      } else {
        alert(data.message || 'Failed to save pet');
      }
    } catch (error) {
      console.error('Error saving pet:', error);
      alert('Failed to save pet');
    } finally {
      setUploading(false);
    }
  };

  const confirmDeletePet = (pet) => {
    setDeleteTarget(pet);
  };

  

  const closeModals = () => {
    setIsPetModalOpen(false);
    setEditingPet(null);
    setDeleteTarget(null);
    setImageFile(null);
    setImagePreview("");
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
                <option value="booked">Booked Only</option>
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
                        key={pet._id}
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
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 lg:p-8 my-8">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {editingPet ? "Edit Pet" : "Add New Pet"}
                  </h3>
                  <button
                    onClick={closeModals}
                    className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <form
                  onSubmit={handleSavePet}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm"
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
                        <option>Booked</option>
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
                        rows={3}
                        value={form.description}
                        onChange={handlePetFormChange}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">
                        Size
                      </label>
                      <select
                        name="size"
                        value={form.size}
                        onChange={handlePetFormChange}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option>Small</option>
                        <option>Medium</option>
                        <option>Large</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">
                        In Shelter (Duration)
                      </label>
                      <input
                        type="text"
                        name="inShelter"
                        value={form.inShelter}
                        onChange={handlePetFormChange}
                        placeholder="e.g. 5 months"
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
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
                          className="mt-2 w-full h-48 rounded-xl object-cover border border-slate-100"
                        />
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-3 border-t border-slate-200 pt-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-900">
                        Vaccination Records
                      </h4>
                      <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          name="vaccinated"
                          checked={form.vaccinated}
                          onChange={(e) => {
                            const anyVaccineCompleted = form.vaccinations.some(v => v.status === 'completed');
                            if (!e.target.checked && anyVaccineCompleted) {
                              alert("Cannot uncheck vaccinated status because one or more vaccines are already marked as completed. Please change vaccine status to 'pending' first.");
                              return;
                            }
                            setForm((prev) => ({ ...prev, vaccinated: e.target.checked }));
                          }}
                          className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-xs font-medium">Vaccinated</span>
                      </label>
                      {form.vaccinations.some(v => v.status === 'completed') && (
                        <p className="text-[10px] text-amber-600 mt-1">
                          ⚠️ Cannot uncheck while vaccines are completed
                        </p>
                      )}
                    </div>
                    {form.vaccinated && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2">
                        {form.vaccinations.map((vaccine, index) => (
                        <div
                          key={index}
                          className="border border-slate-200 rounded-lg p-2 bg-slate-50/50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-slate-700">
                              {vaccine.name}
                            </label>
                            <select
                              value={vaccine.status}
                              onChange={(e) =>
                                handleVaccinationChange(index, 'status', e.target.value)
                              }
                              className="text-[11px] border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                          {vaccine.status === 'completed' && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 mb-1">
                                  Vaccination Date
                                </label>
                                <input
                                  type="date"
                                  value={vaccine.date}
                                  onChange={(e) =>
                                    handleVaccinationChange(index, 'date', e.target.value)
                                  }
                                  className="w-full text-[11px] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-500 mb-1">
                                  Next Due Date
                                </label>
                                <input
                                  type="date"
                                  value={vaccine.nextDue}
                                  onChange={(e) =>
                                    handleVaccinationChange(index, 'nextDue', e.target.value)
                                  }
                                  className="w-full text-[11px] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
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
                      className="px-6 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed"
                    >
                      {uploading ? "Uploading..." : (editingPet ? "Save Changes" : "Add Pet")}
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