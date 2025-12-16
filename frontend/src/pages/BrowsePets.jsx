import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const PETS = [
  {
    id: 1,
    name: "Bruno",
    type: "Dog",
    ageMonths: 11,
    ageLabel: "11 Months Old",
    breed: "Golden Retriever",
    gender: "Male",
    size: "Large",
    vaccinated: true,
    inShelter: "5 months",
    image: "/photo/golden-retriever.avif",
   },
  {
    id: 2,
    name: "Lussy",
    type: "Dog",
    ageMonths: 11,
    ageLabel: "11 Months Old",
    breed: "Labrador Retriever",
    gender: "Female",
    size: "Medium",
    vaccinated: true,
    inShelter: "7 months",
    image:"/photo/labrador-retriever.avif"
  },
  {
    id: 3,
    name: "Coco",
    type: "Dog",
    ageMonths: 11,
    ageLabel: "1 Months Old",
    breed: "Pug",
    gender: "Male",
    size: "Small",
    vaccinated: true,
    inShelter: "1 months",
    image:"/photo/pug.avif"
  },
  {
    id: 4,
    name: "Torres",
    type: "Dog",
    ageMonths: 7,
    ageLabel: "9 Months Old",
    breed: "German Shepherd",
    gender: "Male",
    size: "Small",
    vaccinated: true,
    inShelter: "5 months",
    image: "/photo/german-shepherd.avif"
  },
  {
    id: 5,
    name: "Syke",
    type: "Dog",
    ageMonths: 8,
    ageLabel: "8 Months Old",
    breed: "Husky",
    gender: "Male",
    size: "Large",
    vaccinated: true,
    inShelter: "5 months",
    image: "/photo/husky.avif"
  },
  {
    id: 6,
    name: "Oreo",
    type: "Cat",
    ageMonths: 5,
    ageLabel: "5 Months Old",
    breed: "Abyssinian",
    gender: "Male",
    size: "Small",
    vaccinated: true,
    inShelter: "5 months",
    image:"/photo/abyssinian.avif"
  },
  {
    id: 7,
    name: "Kiwi",
    type: "Cat",
    ageMonths: 5,
    ageLabel: "5 Months Old",
    breed: "Bengal",
    gender: "Female",
    size: "Small",
    vaccinated: false,
    inShelter: "5 months",
    image: "/photo/bengal.avif" 
   },
  {
    id: 8,
    name: "Bella",
    type: "Rabbit",
    ageMonths: 8,
    ageLabel: "8 Months Old",
    breed: "Californian",
    gender: "Female",
    size: "Medium",
    vaccinated: true,
    inShelter: "5 months",
    image: "/photo/californian.avif"
  },
  {
    id: 9,
    name: "Carrot",
    type: "Rabbit",
    ageMonths: 4,
    ageLabel: "4 Months Old",
    breed: "Rex",
    gender: "Male",
    size: "Small",
    vaccinated: false,
    inShelter: "5 months",
    image: "photo/rex.avif"
  },
];

const BrowsePets = () => {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [gender, setGender] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [size, setSize] = useState("");
  const [vaccinated, setVaccinated] = useState("");

  const petTypes = useMemo(
    () => Array.from(new Set(PETS.map((p) => p.type))),
    []
  );
  const sizes = useMemo(
    () => Array.from(new Set(PETS.map((p) => p.size))),
    []
  );
  const genders = useMemo(
    () => Array.from(new Set(PETS.map((p) => p.gender))),
    []
  );

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
    return PETS.filter((pet) => {
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
  }, [search, selectedTypes, gender, size, vaccinated, ageRange]);

  return (
    <div className="min-h-screen bg-[#fff7f0] flex flex-col">
        {/* NAVBAR */}
  <header className="sticky top-0 z-20 bg-white border-b border-orange-100/80 px-6 lg:px-16 py-4 flex items-center justify-between">
    {/* Left: logo same as Login */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
        <span className="text-2xl">🐾</span>
      </div>
      <span className="text-2xl font-bold text-slate-900">
        Pet<span className="text-orange-500">Adopt+</span>
      </span>
    </div>

        <nav className="hidden md:flex gap-6 text-sm text-slate-500">
          <a href="#" className="hover:text-slate-900">
            Home
          </a>
          <a
            href="#"
            className="text-orange-500 border-b-2 border-orange-400 pb-0.5"
          >
            Browse Pets
          </a>
          <a href="#" className="hover:text-slate-900">
            Pet Hotel
          </a>
          <a href="#" className="hover:text-slate-900">
            Shop
          </a>
          <a href="#" className="hover:text-slate-900">
            About
          </a>
          <a href="#" className="hover:text-slate-900">
            Profile
          </a>
        </nav>
      </header>

      {/* SEARCH BAR */}
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

      {/* MAIN CONTENT */}
      <div className="flex-1 px-6 lg:px-16 py-4 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 items-start">
          {/* FILTERS */}
          <aside className="md:col-span-1 bg-[#fffaf4] border border-orange-100 rounded-2xl p-4 shadow-sm md:sticky md:top-28 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
              <button
                onClick={resetFilters}
                className="text-xs text-orange-500 hover:text-orange-600"
              >
                Reset
              </button>
            </div>

            {/* Pet Type */}
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

            {/* Gender */}
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

            {/* Age */}
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

            {/* Size */}
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

            {/* Vaccinated */}
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

          {/* PET CARDS GRID */}
          <main className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Available Pets
              </h2>
              <span className="text-xs text-slate-500">
                {filteredPets.length} found
              </span>
            </div>

            {filteredPets.length === 0 ? (
              <div className="border border-dashed border-orange-200 rounded-xl bg-white p-6 text-center text-sm text-slate-500">
                <p>No pets match the selected filters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-3 inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-orange-400 text-orange-500 text-xs hover:bg-orange-50"
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
                          Vaccinated: {pet.vaccinated ? "Yes" : "No"}
                        </span>
                      </p>
                      <div className="pt-1 flex justify-end">
                         <Link to={`/pet-details/${pet.id}`}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-slate-800 text-[11px] font-medium text-slate-900 hover:bg-slate-900 hover:text-white"
                         >
                            View Details
                         </Link>
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