import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const AdoptionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // pet id from URL
  const location = useLocation();

  // Data passed from PetDetails via navigate state
  const petName = location.state?.petName || "Selected Pet";
  const petImage = location.state?.petImage || "/photo/golden-retriever.avif";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    age: "",
    occupation: "",
    ownsPets: "",
    reason: "",
    experience: "",
    environment: "",
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "age" && value !== "") {
      const num = Number(value);
      if (Number.isNaN(num) || num < 0) return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!form.address.trim()) newErrors.address = "Address is required.";
    if (!form.age.trim()) newErrors.age = "Age is required.";
    else if (Number(form.age) < 18)
      newErrors.age = "You must be at least 18 years old.";
    if (!form.occupation.trim())
      newErrors.occupation = "Occupation is required.";
    if (!form.ownsPets) newErrors.ownsPets = "Please select an option.";
    if (!form.reason.trim())
      newErrors.reason = "Please tell us why you want to adopt.";
    if (!form.experience) newErrors.experience = "Please select an option.";
    if (!form.environment)
      newErrors.environment = "Please choose your living environment.";
    if (!form.agree)
      newErrors.agree = "You must agree to the adoption terms.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch(`${API_URL}/api/adoptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petId: id,
          petName: petName,
          ...form,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7f0] to-[#ffe8d6] flex flex-col">
      {/* Header with pet info */}
      <header className="w-full px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-xl">🐾</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">
              Adoption Application
            </p>
            <h1 className="text-lg font-semibold text-slate-900">
              Adopt {petName}
            </h1>
            <p className="text-[11px] text-slate-500">Pet ID: {id}</p>
          </div>
        </div>

        <button
          onClick={goBack}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          Cancel / Go Back
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 lg:px-16 pb-10">
        <div className="w-full max-w-5xl bg-white/95 shadow-xl rounded-3xl p-5 lg:p-8">
          {/* Pet thumbnail */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src={petImage}
              alt={petName}
              className="w-14 h-14 rounded-2xl object-cover border border-orange-100"
            />
            <div>
              <p className="text-xs text-slate-500">You are applying for</p>
              <p className="text-sm font-semibold text-slate-900">
                {petName}
              </p>
            </div>
          </div>

          {submitted ? (
            // Success state
            <div className="border border-green-200 bg-green-50 rounded-2xl p-6 text-center">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Application Submitted!
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Thank you, {form.fullName}. Your adoption application for{" "}
                <span className="font-semibold">{petName}</span> has been
                received. Our team will contact you shortly via email or phone.
              </p>
              <button
                onClick={() => navigate("/browse-pets")}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
              >
                Back to Browse
              </button>
            </div>
          ) : (
            // Form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Two columns on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: User Info */}
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Your Information
                  </h2>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-[1.5px] focus:ring-orange-500"
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-[1.5px] focus:ring-orange-500"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-[1.5px] focus:ring-orange-500"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      rows={2}
                      value={form.address}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-[1.5px] focus:ring-orange-500"
                    />
                    {errors.address && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        name="age"
                        min={18}
                        max={120}
                        value={form.age}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e" || e.key === "E") {
                            e.preventDefault();
                          }
                        }}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-[1.5px] focus:ring-orange-500"
                      />
                      {errors.age && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {errors.age}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Occupation *
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={form.occupation}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-[1.5px] focus:ring-orange-500"
                      />
                      {errors.occupation && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {errors.occupation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Pet ownership info */}
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Pet Ownership Details
                  </h2>

                  <div>
                    <p className="block text-xs font-medium text-slate-600 mb-1">
                      Do you currently own pets? *
                    </p>
                    <div className="flex gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="ownsPets"
                          value="yes"
                          checked={form.ownsPets === "yes"}
                          onChange={handleChange}
                          className="text-orange-500 border-slate-300 focus:ring-orange-500"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="ownsPets"
                          value="no"
                          checked={form.ownsPets === "no"}
                          onChange={handleChange}
                          className="text-orange-500 border-slate-300 focus:ring-orange-500"
                        />
                        <span>No</span>
                      </label>
                    </div>
                    {errors.ownsPets && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.ownsPets}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Why do you want to adopt this pet? *
                    </label>
                    <textarea
                      name="reason"
                      rows={3}
                      value={form.reason}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-[1.5px] focus:ring-orange-500"
                    />
                    {errors.reason && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.reason}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="block text-xs font-medium text-slate-600 mb-1">
                      Do you have experience with this type of pet? *
                    </p>
                    <div className="flex gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="experience"
                          value="yes"
                          checked={form.experience === "yes"}
                          onChange={handleChange}
                          className="text-orange-500 border-slate-300 focus:ring-orange-500"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="experience"
                          value="no"
                          checked={form.experience === "no"}
                          onChange={handleChange}
                          className="text-orange-500 border-slate-300 focus:ring-orange-500"
                        />
                        <span>No</span>
                      </label>
                    </div>
                    {errors.experience && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.experience}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Living environment type *
                    </label>
                    <select
                      name="environment"
                      value={form.environment}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-[1.5px] focus:ring-orange-500"
                    >
                      <option value="">Select one</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.environment && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.environment}
                      </p>
                    )}
                  </div>

                  <div className="mt-2">
                    <label className="flex items-start gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        name="agree"
                        checked={form.agree}
                        onChange={handleChange}
                        className="mt-[2px] text-orange-500 border-slate-300 focus:ring-orange-500"
                      />
                      <span>
                        I confirm that the information provided is accurate and
                        I agree to follow all adoption terms and
                        responsibilities.
                      </span>
                    </label>
                    {errors.agree && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.agree}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  Cancel / Go Back
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdoptionForm;