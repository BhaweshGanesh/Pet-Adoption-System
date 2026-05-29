import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const VaccinationDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const petName = petData?.name || location.state?.petName || "Selected Pet";
  const petImage = petData?.image || location.state?.petImage || "/photo/golden-retriever.avif";

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/api/pets/${id}`);
        const data = await response.json();

        if (data.success) {
          setPetData(data.data);
        } else {
          setError('Failed to fetch pet data');
        }
      } catch (err) {
        console.error('Error fetching pet data:', err);
        setError('Failed to load vaccination records');
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [id]);

  const records = petData?.vaccinations && petData.vaccinations.length > 0
    ? petData.vaccinations.map(v => ({
        ...v,
        date: v.date ? new Date(v.date).toISOString().split('T')[0] : null,
        nextDue: v.nextDue ? new Date(v.nextDue).toISOString().split('T')[0] : null
      }))
    : [
        { name: "Rabies", status: "pending", date: null, nextDue: null },
        { name: "DHPP", status: "pending", date: null, nextDue: null },
        { name: "Parvovirus", status: "pending", date: null, nextDue: null },
        { name: "Bordetella", status: "pending", date: null, nextDue: null }
      ];

  const anyVaccineCompleted = records.some(v => v.status === "completed");
  const isOfficiallyVaccinated = petData?.vaccinated && anyVaccineCompleted;

  const goBack = () => {
    navigate(`/pet-details/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff7f0] to-[#ffe8d6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading vaccination records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff7f0] to-[#ffe8d6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7f0] to-[#ffe8d6] flex flex-col">
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

      <main className="flex-1 flex items-start justify-center px-4 lg:px-16 pb-10">
        <div className="w-full max-w-4xl bg-white/95 shadow-xl rounded-3xl p-5 lg:p-7">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base lg:text-lg font-semibold text-slate-900">
                Vaccination Details
              </h2>
              <p className="text-xs text-slate-500">
                {records.filter((r) => r.status === "completed").length} of{" "}
                {records.length} completed
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              isOfficiallyVaccinated
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <span className="text-sm">{isOfficiallyVaccinated ? '✓' : '⚠'}</span>
              <span>
                Official Status: {isOfficiallyVaccinated ? 'Vaccinated' : 'Pending'}
              </span>
            </div>
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