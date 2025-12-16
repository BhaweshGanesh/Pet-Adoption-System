import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Sample vaccination data by pet id
const VACCINATION_DATA = {
  1: [
    {
      name: "Rabies",
      status: "completed",
      date: "2025-01-05",
      nextDue: "2026-01-05",
    },
    {
      name: "DHPP",
      status: "completed",
      date: "2024-12-10",
      nextDue: "2025-12-10",
    },
    {
      name: "Parvovirus",
      status: "completed",
      date: "2024-11-20",
      nextDue: "2025-11-20",
    },
    {
      name: "Bordetella",
      status: "pending",
      date: null,
      nextDue: null,
    },
    {
      name: "Leptospirosis",
      status: "pending",
      date: null,
      nextDue: null,
    },
    {
      name: "Deworming",
      status: "completed",
      date: "2025-02-15",
      nextDue: "2025-08-15",
    },
    {
      name: "Tick / Flea Treatment",
      status: "completed",
      date: "2025-03-01",
      nextDue: "2025-06-01",
    },
  ],
  2: [
    { name: "Rabies", status: "completed", date: "2024-10-12", nextDue: "2025-10-12" },
    { name: "DHPP", status: "completed", date: "2024-09-01", nextDue: "2025-09-01" },
    { name: "Parvovirus", status: "completed", date: "2024-09-01", nextDue: "2025-09-01" },
    { name: "Bordetella", status: "completed", date: "2025-02-01", nextDue: "2026-02-01" },
    { name: "Leptospirosis", status: "pending", date: null, nextDue: null },
    { name: "Deworming", status: "completed", date: "2025-01-10", nextDue: "2025-07-10" },
    { name: "Tick / Flea Treatment", status: "completed", date: "2025-03-05", nextDue: "2025-06-05" },
  ],
  // default for others if not specified
};

const VaccinationDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const petName = location.state?.petName || "Selected Pet";
  const petImage = location.state?.petImage || "/photo/golden-retriever.avif";

  const records = useMemo(() => {
    const key = Number(id);
    return VACCINATION_DATA[key] || [
      {
        name: "Rabies",
        status: "pending",
        date: null,
        nextDue: null,
      },
      {
        name: "DHPP",
        status: "pending",
        date: null,
        nextDue: null,
      },
      {
        name: "Parvovirus",
        status: "pending",
        date: null,
        nextDue: null,
      },
      {
        name: "Bordetella",
        status: "pending",
        date: null,
        nextDue: null,
      },
      {
        name: "Leptospirosis",
        status: "pending",
        date: null,
        nextDue: null,
      },
      {
        name: "Deworming",
        status: "pending",
        date: null,
        nextDue: null,
      },
      {
        name: "Tick / Flea Treatment",
        status: "pending",
        date: null,
        nextDue: null,
      },
    ];
  }, [id]);

  const goBack = () => {
    // back to pet details page
    navigate(`/pet-details/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7f0] to-[#ffe8d6] flex flex-col">
      {/* Header with pet name + image */}
      <header className="w-full px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={petImage}
            alt={petName}
            className="w-12 h-12 rounded-2xl object-cover border border-orange-100"
          />
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">
              Vaccination Record
            </p>
            <h1 className="text-lg font-semibold text-slate-900">
              {petName}
            </h1>
            <p className="text-[11px] text-slate-500">Pet ID: {id}</p>
          </div>
        </div>

        <button
          onClick={goBack}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          Back to Details
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 lg:px-16 pb-10">
        <div className="w-full max-w-4xl bg-white/95 shadow-xl rounded-3xl p-5 lg:p-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold text-slate-900">
              Vaccination Details
            </h2>
            <p className="text-xs text-slate-500">
              {records.filter((r) => r.status === "completed").length} of{" "}
              {records.length} completed
            </p>
          </div>

          <div className="space-y-3">
            {records.map((vaccine, index) => {
              const isCompleted = vaccine.status === "completed";
              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100 rounded-2xl px-4 py-3 bg-[#fffaf4]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        isCompleted
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {isCompleted ? "✔️" : "⚠️"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {vaccine.name}
                      </p>
                      <p
                        className={`text-[11px] font-medium mt-0.5 ${
                          isCompleted ? "text-green-600" : "text-yellow-700"
                        }`}
                      >
                        {isCompleted ? "Completed" : "Not Yet Vaccinated"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 text-[11px] text-slate-600">
                    <div>
                      <p className="uppercase tracking-wide text-slate-400">
                        Date
                      </p>
                      <p>
                        {vaccine.date ? vaccine.date : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wide text-slate-400">
                        Next Due
                      </p>
                      <p>
                        {vaccine.nextDue ? vaccine.nextDue : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VaccinationDetails;