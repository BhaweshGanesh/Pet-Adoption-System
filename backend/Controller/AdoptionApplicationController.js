import AdoptionApplication from '../model/AdoptionApplicationmodel.js';
import Pet from '../model/Petmodel.js';

// @desc    Submit adoption application
// @route   POST /api/adoptions
// @access  Public
export const submitApplication = async (req, res) => {
  try {
    const {
      petId,
      petName,
      fullName,
      email,
      phone,
      address,
      age,
      occupation,
      ownsPets,
      reason,
      experience,
      environment,
      agree,
    } = req.body;

    // Validation
    if (!petId || !fullName || !email || !phone || !address || !age || !occupation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (!agree) {
      return res.status(400).json({
        success: false,
        message: 'You must agree to the adoption terms',
      });
    }

    // Check if pet exists
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    // Create application
    const application = await AdoptionApplication.create({
      petId,
      petName: petName || pet.name,
      fullName,
      email,
      phone,
      address,
      age,
      occupation,
      ownsPets,
      reason,
      experience,
      environment,
      agree,
      userId: req.user?._id, // If user is logged in
    });

    res.status(201).json({
      success: true,
      message: 'Adoption application submitted successfully',
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while submitting application',
      error: error.message,
    });
  }
};

// @desc    Get all adoption applications
// @route   GET /api/adoptions
// @access  Private/Admin
export const getAllApplications = async (req, res) => {
  try {
    const { status, petId } = req.query;
    
    let filter = {};
    if (status) {
      filter.status = status;
    }
    if (petId) {
      filter.petId = petId;
    }

    const applications = await AdoptionApplication.find(filter)
      .populate('petId', 'name type breed image')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications',
      error: error.message,
    });
  }
};

// @desc    Get single adoption application by ID
// @route   GET /api/adoptions/:id
// @access  Private/Admin
export const getApplicationById = async (req, res) => {
  try {
    const application = await AdoptionApplication.findById(req.params.id)
      .populate('petId', 'name type breed image age gender')
      .populate('reviewedBy', 'fullName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching application',
      error: error.message,
    });
  }
};

// @desc    Update application status (approve/reject)
// @route   PUT /api/adoptions/:id/status
// @access  Private/Admin
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!status || !['approved', 'rejected', 'pending', 'withdrawn'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided',
      });
    }

    const application = await AdoptionApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    application.status = status;
    application.reviewNotes = reviewNotes || application.reviewNotes;
    application.reviewedBy = req.user?._id;
    application.reviewedAt = new Date();

    await application.save();

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating application',
      error: error.message,
    });
  }
};

// @desc    Delete adoption application
// @route   DELETE /api/adoptions/:id
// @access  Private/Admin
export const deleteApplication = async (req, res) => {
  try {
    const application = await AdoptionApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting application',
      error: error.message,
    });
  }
};

// @desc    Get applications by user email
// @route   GET /api/adoptions/user/:email
// @access  Public
export const getApplicationsByEmail = async (req, res) => {
  try {
    const applications = await AdoptionApplication.find({ 
      email: req.params.email 
    })
      .populate('petId', 'name type breed image')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications',
      error: error.message,
    });
  }
};

