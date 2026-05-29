import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';

const MyAdoptions = () => {
  const [adoptions, setAdoptions] = useState({ approved: [], pending: [], rejected: [], all: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdoptionHistory();
  }, []);

  const fetchAdoptionHistory = async () => {
    try {
      const token = localStorage.getItem('token');  
      
      if (!token) {
        setError('Please log in to view your adoption history');
        setLoading(false);
        return;
      }

      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/adoptions/my-adoptions`;
      console.log('🔍 Fetching adoption history...');
      console.log('📍 API URL:', apiUrl);
      console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.success) {
        console.log('✅ Successfully loaded adoptions:', data.count);
        setAdoptions(data.data);
        setError('');
      } else {
        console.error('❌ Failed to load adoptions:', data.message);
        setError(data.message || 'Failed to fetch adoption history');
      }
    } catch (err) {
      console.error('💥 Error fetching adoption history:', err);
      setError('Failed to load adoption history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTabData = () => {
    return adoptions[selectedTab] || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <UserNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <UserNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Adoption History</h1>
          <p className="text-gray-600">Track all your pet adoption applications and their status</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 bg-white p-2 rounded-lg shadow-sm">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedTab === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({adoptions.all.length})
          </button>
          <button
            onClick={() => setSelectedTab('approved')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedTab === 'approved'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved ({adoptions.approved.length})
          </button>
          <button
            onClick={() => setSelectedTab('pending')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedTab === 'pending'
                ? 'bg-yellow-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({adoptions.pending.length})
          </button>
          <button
            onClick={() => setSelectedTab('rejected')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedTab === 'rejected'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected ({adoptions.rejected.length})
          </button>
        </div>

        {/* Adoptions List */}
        {getTabData().length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No {selectedTab !== 'all' ? selectedTab : ''} applications found
            </h3>
            <p className="text-gray-500 mb-6">
              {selectedTab === 'all'
                ? "You haven't submitted any adoption applications yet."
                : `You don't have any ${selectedTab} applications.`}
            </p>
            <button
              onClick={() => navigate('/browse-pets')}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Browse Available Pets
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getTabData().map((application) => (
              <div
                key={application._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {/* Pet Image */}
                <div className="relative h-48 bg-gray-200">
                  {application.petId?.image ? (
                    <img
                      src={application.petId.image}
                      alt={application.petId.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-6xl">
                      🐾
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {application.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Application Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {application.petId?.name || application.petName}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {application.petId?.breed && (
                      <p className="flex items-center">
                        <span className="font-semibold mr-2">Breed:</span>
                        {application.petId.breed}
                      </p>
                    )}
                    {application.petId?.type && (
                      <p className="flex items-center">
                        <span className="font-semibold mr-2">Type:</span>
                        {application.petId.type}
                      </p>
                    )}
                    {application.petId?.age && (
                      <p className="flex items-center">
                        <span className="font-semibold mr-2">Age:</span>
                        {application.petId.age}
                      </p>
                    )}
                    {application.petId?.gender && (
                      <p className="flex items-center">
                        <span className="font-semibold mr-2">Gender:</span>
                        {application.petId.gender}
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold text-gray-700">Applied on:</span>{' '}
                      <span className="text-gray-600">{formatDate(application.createdAt)}</span>
                    </p>
                    
                    {application.status === 'approved' && application.reviewedAt && (
                      <p className="text-sm">
                        <span className="font-semibold text-green-700">Approved on:</span>{' '}
                        <span className="text-green-600">{formatDate(application.reviewedAt)}</span>
                      </p>
                    )}
                    
                    {application.status === 'rejected' && application.reviewedAt && (
                      <p className="text-sm">
                        <span className="font-semibold text-red-700">Rejected on:</span>{' '}
                        <span className="text-red-600">{formatDate(application.reviewedAt)}</span>
                      </p>
                    )}

                    {application.reviewNotes && (
                      <div className="mt-3">
                        <p className="font-semibold text-gray-700 text-sm mb-1">Admin Notes:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          {application.reviewNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {application.status === 'approved' && (
                    <div className="mt-4">
                      <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                        🎉 Congratulations!
                      </button>
                    </div>
                  )}
                  
                  {application.status === 'pending' && (
                    <div className="mt-4">
                      <button className="w-full bg-yellow-100 text-yellow-800 py-2 rounded-lg font-medium border border-yellow-300 cursor-default">
                        ⏳ Under Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAdoptions;
