import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Sample data – keep ids same as in BrowsePets
const PETS = [
  {
    id: 1,
    name: "Bruno",
    breed: "Golden Retriever",
    ageLabel: "2 Months Old",
    gender: "Male",
    size: "Large",
    Inshelter: "4 months",
    vaccinated: true,
    description:
      "Bruno is a playful and friendly Golden Retriever who loves people and other pets. He enjoys outdoor walks and cuddling on the couch.",
    image: "/photo/golden-retriever.avif",
  },
  {
    id: 2,
    name: "Lussy",
    breed: "Labrador Retriever",
    ageLabel: "5 Months Old",
    gender: "Female",
    size: "Medium",
    Inshelter: "5 months",
    vaccinated: true,
    description:
      "Lussy is an energetic Labrador who loves playing fetch and is very loyal to her family.",
    image: "/photo/labrador-retriever.avif",
  },
  {
    id: 3,
    name: "Coco",
    breed: "Pug",
    ageLabel: "1 Months Old",
    gender: "Male",
    size: "Small",
    Inshelter: "7 months",
    vaccinated: true,
    description:
      "Coco is a calm and affectionate pug looking for a loving home. Perfect for apartment living.",
    image: "/photo/pug.avif",
  },
  {
    id: 4,
    name: "Torres",
    breed: "German Shepherd",
    ageLabel: "1.5 Months Old",
    gender: "Male",
    size: "Large",
    Inshelter: "2 months",
    vaccinated: true,
    description:
      "Torres is an alert and intelligent German Shepherd who enjoys training and outdoor activities.",
    image: "/photo/german-shepherd.avif",
  },
  {
    id: 5,
    name: "Syke",
    breed: "Husky",
    ageLabel: "8 Months Old",
    gender: "Male",
    size: "Large",
    Inshelter: "5 months",
    vaccinated: true,
    description:
      "Syke is a friendly husky who loves cold weather, long walks and plenty of playtime.",
    image: "/photo/husky.avif",
  },
  // ...add the rest of your pets with matching ids if you want
];

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const pet = useMemo(
    () => PETS.find((p) => p.id === Number(id)),
    [id]
  );

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff7f0]">
        <div className="bg-white shadow-md rounded-xl px-8 py-6 text-center">
          <p className="text-slate-700 mb-4">
            Pet not found. It may have been adopted already.
          </p>
          <button
            onClick={() => navigate("/browse-pets")}
            className="px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7f0] to-[#ffe8d6] flex flex-col">
      {/* Top bar  */}
     <header className="w-full bg-white border-b border-gray-200">
  <nav className="px-6 lg:px-16 py-4 flex items-center">
    {/* Logo */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
        <span className="text-2xl">🐾</span>
      </div>
      <span className="text-2xl font-bold text-slate-900">
        Pet<span className="text-orange-500">Adopt+</span>
      </span>
    </div>
  </nav>
</header>
    

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 lg:px-16 pb-10">
        <div className="w-full max-w-5xl bg-white shadow-xl rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Large Image */}
          <div className="relative bg-slate-900/5">
            <img
              src={pet.image}
              alt={pet.name}
              className="w-full h-full object-cover max-h-[520px]"
            />
            <span className="absolute top-4 left-4 bg-white/90 text-xs font-semibold text-orange-600 px-3 py-1 rounded-full shadow">
              Ready for Adoption
            </span>
          </div>

          {/* Right: Details */}
          <div className="p-6 lg:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-orange-500 mb-2">
                Pet Profile
              </p>
              <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
                {pet.name}
              </h1>
              <p className="text-sm text-slate-500 mb-4">{pet.breed}</p>

              <div className="grid grid-cols-2 gap-3 mb-6 text-xs lg:text-sm">
                <div className="bg-[#fff7f0] rounded-xl px-3 py-2">
                  <p className="text-[11px] text-slate-500 uppercase">
                    Age
                  </p>
                  <p className="text-slate-900 font-medium">
                    {pet.ageLabel}
                  </p>
                </div>
                <div className="bg-[#fff7f0] rounded-xl px-3 py-2">
                  <p className="text-[11px] text-slate-500 uppercase">
                    Gender
                  </p>
                  <p className="text-slate-900 font-medium">
                    {pet.gender}
                  </p>
                </div>
                <div className="bg-[#fff7f0] rounded-xl px-3 py-2">
                  <p className="text-[11px] text-slate-500 uppercase">
                    Size
                  </p>
                  <p className="text-slate-900 font-medium">
                    {pet.size}
                  </p>
                </div>
                <div className="bg-[#fff7f0] rounded-xl px-3 py-2">
                  <p className="text-[11px] text-slate-500 uppercase">
                    In shelter
                  </p>
                  <p className="text-slate-900 font-medium">
                    {pet.Inshelter}
                  </p>
                </div>

                {/* Vaccination status – clickable */}
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/vaccinations/${pet.id}`, {
                      state: { petName: pet.name, petImage: pet.image },
                    })
                  }
                  className="bg-[#fff7f0] rounded-xl px-3 py-2 text-left hover:bg-[#ffe8d6] transition col-span-2"
                >
                  <p className="text-[11px] text-slate-500 uppercase">
                    Vaccination Status
                  </p>
                  <p className="text-slate-900 font-medium underline decoration-dotted">
                    {pet.vaccinated
                      ? "Fully Vaccinated – View Details"
                      : "View Schedule"}
                  </p>
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-2">
                  About {pet.name}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {pet.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => setShowModal(true)}
                className="w-full inline-flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 shadow-md"
              >
                Adopt Now
              </button>
              <button
                onClick={() => navigate("/browse-pets")}
                className="w-full inline-flex items-center justify-center rounded-full border border-slate-300 text-slate-700 text-sm font-medium py-2.5 hover:bg-slate-50"
              >
                Back to Browse
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Simple modal for Adopt Now */}
      {showModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Adoption Request for {pet.name}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              We’re excited to help you give Bruno a new loving home! Please complete the adoption form so we can learn a little about you.

            </p>

            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                navigate(`/adopt/${pet.id}`, {
                  state: { petName: pet.name, petImage: pet.image },
                });
              }}
              className="w-full mb-2 inline-flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 shadow-md"
            >
              Continue to Adoption Form
            </button>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full inline-flex items-center justify-center rounded-full border border-slate-300 text-slate-700 text-sm font-medium py-2.5 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div> 
        </div>
      )}
    </div>
  );
};

export default PetDetails;