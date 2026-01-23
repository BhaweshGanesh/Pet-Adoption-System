import React, { useMemo, useState } from "react";
import { useEffect } from 'react';
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";




const AdminPetsManagement = () => {
  const [activeTab, setActiveTab] = useState("pets"); // pets or adoptions
  const [pets, setPets] = useState([]);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [adoptionStatusFilter, setAdoptionStatusFilter] = useState("all");
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false);
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
    fetchAdoptionRequests();
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

  const fetchAdoptionRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/adoptions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAdoptionRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching adoption requests:', error);
    }
  };

  const handleDeletePet = async () => {
    if (!deleteTarget) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:4000/api/pets/${deleteTarget._id}`,
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

  const filteredAdoptions = useMemo(() => {
    if (adoptionStatusFilter === "all") return adoptionRequests;
    return adoptionRequests.filter(a => a.status === adoptionStatusFilter);
  }, [adoptionRequests, adoptionStatusFilter]);

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
      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
          
          {/* Tab Switcher */}
          <div className="flex gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab("pets")}
              className={`px-6 py-2 rounded-t-lg font-semibold text-sm transition-colors cursor-pointer ${
                activeTab === "pets"
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              🐕 Pets Management
            </button>
            <button
              onClick={() => setActiveTab("adoptions")}
              className={`px-6 py-2 rounded-t-lg font-semibold text-sm transition-colors cursor-pointer ${
                activeTab === "adoptions"
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              📋 Adoption Requests
              {adoptionRequests.filter(a => a.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                  {adoptionRequests.filter(a => a.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          {/* Pets Tab Content */}
          {activeTab === "pets" && (
            <>
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
                className="inline-flex items-center gap-1 rounded-full bg-orange-500 text-white text-xs font-semibold px-4 py-2 hover:bg-orange-600 shadow-sm cursor-pointer"
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
                              className="px-3 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDeletePet(pet)}
                              className="px-3 py-1 rounded-full border border-red-200 text-[11px] text-red-600 hover:bg-red-50 cursor-pointer"
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
                    className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer"
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
                      className="px-5 py-2 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {uploading ? "Uploading..." : (editingPet ? "Save Changes" : "Add Pet")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

            </>
          )}

          {/* Adoption Requests Tab Content */}
          {activeTab === "adoptions" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Manage Adoption Applications
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Review and process adoption requests from potential pet parents
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={adoptionStatusFilter}
                    onChange={(e) => setAdoptionStatusFilter(e.target.value)}
                    className="border border-slate-200 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="all">All Applications</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Adoption Requests Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">Applicant</th>
                        <th className="px-4 py-3 text-left">Pet</th>
                        <th className="px-4 py-3 text-left">Contact</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdoptions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-6 text-center text-slate-500"
                          >
                            No adoption requests found.
                          </td>
                        </tr>
                      ) : (
                        filteredAdoptions.map((adoption) => (
                          <tr
                            key={adoption._id}
                            className="border-t border-slate-100 hover:bg-slate-50/60"
                          >
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-slate-900">
                                  {adoption.fullName}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  Age: {adoption.age} • {adoption.occupation}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {adoption.petId?.image && (
                                  <img
                                    src={adoption.petId.image}
                                    alt={adoption.petName}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {adoption.petName}
                                  </p>
                                  <p className="text-[10px] text-slate-500">
                                    {adoption.petId?.breed}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              <p className="text-[11px]">{adoption.email}</p>
                              <p className="text-[10px] text-slate-500">{adoption.phone}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {new Date(adoption.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  adoption.status === "pending"
                                    ? "bg-amber-50 text-amber-700"
                                    : adoption.status === "approved"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {adoption.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedAdoption(adoption);
                                  setIsAdoptionModalOpen(true);
                                }}
                                className="px-3 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-100 cursor-pointer"
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

          {/* Adoption Details Modal */}
          {isAdoptionModalOpen && selectedAdoption && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 my-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Adoption Application Details
                  </h3>
                  <button
                    onClick={() => {
                      setIsAdoptionModalOpen(false);
                      setSelectedAdoption(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Applicant Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 text-sm border-b pb-2">
                      Applicant Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <label className="text-slate-600 text-xs">Full Name</label>
                        <p className="font-medium text-slate-900">{selectedAdoption.fullName}</p>
                      </div>
                      <div>
                        <label className="text-slate-600 text-xs">Email</label>
                        <p className="font-medium text-slate-900">{selectedAdoption.email}</p>
                      </div>
                      <div>
                        <label className="text-slate-600 text-xs">Phone</label>
                        <p className="font-medium text-slate-900">{selectedAdoption.phone}</p>
                      </div>
                      <div>
                        <label className="text-slate-600 text-xs">Address</label>
                        <p className="font-medium text-slate-900">{selectedAdoption.address}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-600 text-xs">Age</label>
                          <p className="font-medium text-slate-900">{selectedAdoption.age}</p>
                        </div>
                        <div>
                          <label className="text-slate-600 text-xs">Occupation</label>
                          <p className="font-medium text-slate-900">{selectedAdoption.occupation}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pet & Lifestyle Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 text-sm border-b pb-2">
                      Pet & Lifestyle Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <label className="text-slate-600 text-xs">Pet Applying For</label>
                        <p className="font-medium text-slate-900">{selectedAdoption.petName}</p>
                      </div>
                      <div>
                        <label className="text-slate-600 text-xs">Currently Owns Pets</label>
                        <p className="font-medium text-slate-900 capitalize">{selectedAdoption.ownsPets}</p>
                      </div>
                      <div>
                        <label className="text-slate-600 text-xs">Has Pet Experience</label>
                        <p className="font-medium text-slate-900 capitalize">{selectedAdoption.experience}</p>
                      </div>
                      <div>
                        <label className="text-slate-600 text-xs">Living Environment</label>
                        <p className="font-medium text-slate-900 capitalize">{selectedAdoption.environment}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason for Adoption */}
                <div className="mt-6">
                  <h4 className="font-semibold text-slate-900 text-sm border-b pb-2 mb-2">
                    Why They Want to Adopt
                  </h4>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                    {selectedAdoption.reason}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {selectedAdoption.status === 'pending' && (
                      <>
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('token');
                              const response = await fetch(
                                `http://localhost:4000/api/adoptions/${selectedAdoption._id}/status`,
                                {
                                  method: 'PUT',
                                  headers: { 
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ status: 'approved' }),
                                }
                              );
                              const data = await response.json();
                              if (data.success) {
                                alert('✅ Application approved! The applicant will receive an email with pickup details. The pet status has been updated to Unavailable.');
                                fetchAdoptionRequests(); // Refresh adoption requests
                                fetchPets(); // Refresh pets list to show updated status
                                setIsAdoptionModalOpen(false);
                              }
                            } catch (error) {
                              console.error('Error approving application:', error);
                              alert('Failed to approve application');
                            }
                          }}
                          className="flex-1 py-2 bg-emerald-500 text-white rounded-full font-semibold text-sm hover:bg-emerald-600 cursor-pointer"
                        >
                          ✓ Approve Application
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm('Are you sure you want to reject this application?')) return;
                            try {
                              const token = localStorage.getItem('token');
                              const response = await fetch(
                                `http://localhost:4000/api/adoptions/${selectedAdoption._id}/status`,
                                {
                                  method: 'PUT',
                                  headers: { 
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ status: 'rejected' }),
                                }
                              );
                              const data = await response.json();
                              if (data.success) {
                                alert('Application rejected. The pet status has been updated to Available for other adopters.');
                                fetchAdoptionRequests(); // Refresh adoption requests
                                fetchPets(); // Refresh pets list to show updated status
                                setIsAdoptionModalOpen(false);
                              }
                            } catch (error) {
                              console.error('Error rejecting application:', error);
                              alert('Failed to reject application');
                            }
                          }}
                          className="flex-1 py-2 bg-red-500 text-white rounded-full font-semibold text-sm hover:bg-red-600 cursor-pointer"
                        >
                          ✗ Reject Application
                        </button>
                      </>
                    )}
                    {selectedAdoption.status !== 'pending' && (
                      <div className="flex-1 text-center py-2 bg-slate-100 rounded-full">
                        <span className="text-sm font-semibold text-slate-700">
                          Status: {selectedAdoption.status.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={async () => {
                        if (!window.confirm('Are you sure you want to delete this application?')) return;
                        try {
                          const response = await fetch(
                            `http://localhost:4000/api/adoptions/${selectedAdoption._id}`,
                            { method: 'DELETE' }
                          );
                          const data = await response.json();
                          if (data.success) {
                            alert('Application deleted successfully. If it was pending, the pet is now available again.');
                            fetchAdoptionRequests(); // Refresh adoption requests
                            fetchPets(); // Refresh pets list to show updated status
                            setIsAdoptionModalOpen(false);
                          }
                        } catch (error) {
                          console.error('Error deleting application:', error);
                          alert('Failed to delete application');
                        }
                      }}
                      className="py-2 px-6 border-2 border-red-200 text-red-600 rounded-full font-semibold text-sm hover:bg-red-50 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
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