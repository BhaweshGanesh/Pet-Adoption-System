import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";

const BrowsePets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [gender, setGender] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [size, setSize] = useState("");
  const [vaccinated, setVaccinated] = useState("");

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/pets');
      const data = await response.json();

      if (data.success) {
        const availablePets = data.data.filter(pet => pet.status === 'Available' || pet.status === 'Booked');

        const transformedPets = availablePets.map(pet => {
          const vaccinations = pet.vaccinations || [];
          const anyVaccineCompleted = vaccinations.some(v => v.status === 'completed');
          const isVaccinated = pet.vaccinated && anyVaccineCompleted;

          return {
            id: pet._id,
            _id: pet._id,
            name: pet.name || "Unknown",
            type: pet.type || "Other",
            breed: pet.breed || "Unknown",
            gender: pet.gender || "Male",
            ageLabel: pet.age || "Unknown",
            ageMonths: parseAgeToMonths(pet.age),
            size: pet.size || "Medium",
            vaccinated: isVaccinated,
            vaccinationStatus: isVaccinated ? "Yes" : "Pending",
            inShelter: pet.inShelter && pet.inShelter.trim() !== "" ? pet.inShelter : "N/A",
            image: pet.image || "",
            status: pet.status || "Available",
          };
        });
        setPets(transformedPets);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseAgeToMonths = (ageString) => {
    if (!ageString) return 0;
    const lower = ageString.toLowerCase();
    const match = lower.match(/(\d+)\s*(month|year)/);
    if (!match) return 0;
    const value = parseInt(match[1]);
    const unit = match[2];
    return unit.startsWith('year') ? value * 12 : value;
  };

  const petTypes = ['Dog', 'Cat', 'Rabbit', 'Other'];
  const sizes = ['Small', 'Medium', 'Large'];
  const genders = ['Male', 'Female'];

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedTypes([]);
    setGender("");
    setAgeRange("");
    setSize("");
    setVaccinated("");
  };

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const term = search.trim().toLowerCase();
      if (
        term &&
        !(
          pet.name.toLowerCase().includes(term) ||
          pet.breed.toLowerCase().includes(term)
        )
      ) {
        return false;
      }

      if (selectedTypes.length && !selectedTypes.includes(pet.type)) {
        return false;
      }

      if (gender && pet.gender !== gender) return false;

      if (size && pet.size !== size) return false;

      if (vaccinated === "yes" && !pet.vaccinated) return false;
      if (vaccinated === "no" && pet.vaccinated) return false;

      if (ageRange) {
        const m = pet.ageMonths;
        if (ageRange === "0-6" && !(m <= 6)) return false;
        if (ageRange === "7-12" && !(m >= 7 && m <= 12)) return false;
        if (ageRange === "13-36" && !(m >= 13 && m <= 36)) return false;
        if (ageRange === "37+" && !(m >= 37)) return false;
      }

      return true;
    });
  }, [search, selectedTypes, gender, size, vaccinated, ageRange, pets]);

  return (
    <div className="min-h-screen bg-[#fff7f0] flex flex-col">
        <UserNavbar />

      <section className="px-6 lg:px-16 pt-4 pb-2 bg-[#fff7f0]">
        <div className="max-w-xl w-full bg-white border border-orange-100 rounded-full px-4 py-2 flex items-center shadow-sm">
          <span className="text-slate-400 mr-2">🔍</span>
          <input
            type="text"
            className="w-full border-none outline-none text-sm bg-transparent placeholder:text-slate-400"
            placeholder="Search for a pet by name or breed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <div className="flex-1 px-6 lg:px-16 py-4 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 items-start">
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

            <div className="pt-3 border-t border-orange-100">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-2">
                Pet Type
              </p>
              {petTypes.map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 text-sm text-slate-700 mb-1.5"
                >
                  <input
                    type="checkbox"
                    className="rounded border-orange-200 text-orange-500 focus:ring-orange-400"
                    checked={selectedTypes.includes(t)}
                    onChange={() => toggleType(t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-orange-100">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-2">
                Gender
              </p>
              {genders.map((g) => (
                <label
                  key={g}
                  className="flex items-center gap-2 text-sm text-slate-700 mb-1.5"
                >
                  <input
                    type="radio"
                    name="gender"
                    className="text-orange-500 border-orange-200 focus:ring-orange-400"
                    value={g}
                    checked={gender === g}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <span>{g}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="gender"
                  className="text-orange-500 border-orange-200 focus:ring-orange-400"
                  value=""
                  checked={gender === ""}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span>Any</span>
              </label>
            </div>

            <div className="pt-3 border-t border-orange-100">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-2">
                Age
              </p>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="w-full text-sm border border-orange-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                <option value="">Any age</option>
                <option value="0-6">0 – 6 months</option>
                <option value="7-12">7 – 12 months</option>
                <option value="13-36">1 – 3 years</option>
                <option value="37+">3+ years</option>
              </select>
            </div>

            <div className="pt-3 border-t border-orange-100">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-2">
                Size
              </p>
              {sizes.map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2 text-sm text-slate-700 mb-1.5"
                >
                  <input
                    type="radio"
                    name="size"
                    className="text-orange-500 border-orange-200 focus:ring-orange-400"
                    value={s}
                    checked={size === s}
                    onChange={(e) => setSize(e.target.value)}
                  />
                  <span>{s}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="size"
                  className="text-orange-500 border-orange-200 focus:ring-orange-400"
                  value=""
                  checked={size === ""}
                  onChange={(e) => setSize(e.target.value)}
                />
                <span>Any</span>
              </label>
            </div>

            <div className="pt-3 border-t border-orange-100">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-2">
                Vaccinated
              </p>
              <label className="flex items-center gap-2 text-sm text-slate-700 mb-1.5">
                <input
                  type="radio"
                  name="vaccinated"
                  className="text-orange-500 border-orange-200 focus:ring-orange-400"
                  value=""
                  checked={vaccinated === ""}
                  onChange={(e) => setVaccinated(e.target.value)}
                />
                <span>Any</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 mb-1.5">
                <input
                  type="radio"
                  name="vaccinated"
                  className="text-orange-500 border-orange-200 focus:ring-orange-400"
                  value="yes"
                  checked={vaccinated === "yes"}
                  onChange={(e) => setVaccinated(e.target.value)}
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="vaccinated"
                  className="text-orange-500 border-orange-200 focus:ring-orange-400"
                  value="no"
                  checked={vaccinated === "no"}
                  onChange={(e) => setVaccinated(e.target.value)}
                />
                <span>No</span>
              </label>
            </div>
          </aside>

          <main className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Available Pets
              </h2>
              <span className="text-xs text-slate-500">
                {filteredPets.length} found
              </span>
            </div>

            {loading ? (
              <div className="border border-orange-200 rounded-xl bg-white p-6 text-center text-sm text-slate-500">
                <p>Loading pets...</p>
              </div>
            ) : filteredPets.length === 0 ? (
              <div className="border border-dashed border-orange-200 rounded-xl bg-white p-6 text-center text-sm text-slate-500">
                <p>No pets match the selected filters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-3 inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-orange-400 text-orange-500 text-xs hover:bg-orange-50 cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {filteredPets.map((pet) => (
                  <article
                    key={pet.id}
                    className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm flex flex-col"
                  >
                    <div className="relative pt-[70%] overflow-hidden">
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 bg-orange-50 border border-orange-300 text-[11px] text-orange-600 px-2 py-0.5 rounded-full">
                        {pet.type}
                      </span>
                    </div>
                    <div className="p-3.5 flex flex-col gap-1.5 text-xs text-slate-600">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {pet.name}
                      </h3>
                      <p className="flex justify-between gap-2">
                        <span>{pet.ageLabel}</span>
                        <span>{pet.breed}</span>
                      </p>
                      <p className="flex justify-between gap-2">
                        <span>Gender: {pet.gender}</span>
                        <span>Size: {pet.size}</span>
                      </p>
                      <p className="flex justify-between gap-2">
                        <span>In shelter: {pet.inShelter}</span>
                        <span>
                          Vaccinated:
                          <span className={`ml-1 font-semibold ${pet.vaccinated ? 'text-green-600' : 'text-amber-600'}`}>
                            {pet.vaccinationStatus}
                          </span>
                        </span>
                      </p>
                      <p className="flex justify-between gap-2">
                        <span>Status:
                          <span className={`ml-1 font-semibold ${pet.status === 'Available' ? 'text-green-600' : 'text-orange-600'}`}>
                            {pet.status}
                          </span>
                        </span>
                      </p>
                      <div className="pt-1 flex justify-end">
                         {pet.status === 'Booked' ? (
                           <div className="px-3 py-1.5 rounded-full bg-amber-100 text-[11px] font-medium text-amber-800">
                             📋 Application Pending
                           </div>
                         ) : (
                           <Link to={`/pet-details/${pet.id}`}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-slate-800 text-[11px] font-medium text-slate-900 hover:bg-slate-900 hover:text-white"
                           >
                              View Details
                           </Link>
                         )}
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

export default BrowsePets;