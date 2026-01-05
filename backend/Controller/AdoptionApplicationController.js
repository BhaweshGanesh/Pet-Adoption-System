import AdoptionApplication from '../model/AdoptionApplicationmodel.js';
import Pet from '../model/Petmodel.js';
import { sendAdoptionConfirmationEmail, sendAdoptionApprovalEmail } from '../utils/emailService.js';

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

    // Check if pet is available
    if (pet.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'This pet is not available for adoption at this time.',
      });
    }

    // Check if there's already a pending adoption request for this pet
    const existingRequest = await AdoptionApplication.findOne({
      petId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'This pet already has a pending adoption request. Please check back later or browse other pets.',
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

    // Update pet status to "Booked" since there's now a pending adoption request
    pet.status = 'Booked';
    await pet.save();
    console.log(`✅ Pet ${pet.name} status updated to Booked`);

    // Send confirmation email
    try {
      await sendAdoptionConfirmationEmail(email, fullName, {
        petName: petName || pet.name,
        petBreed: pet.breed,
        petAge: pet.age,
        applicationDate: application.createdAt,
        status: application.status,
      });
      console.log(`✅ Adoption confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send adoption confirmation email:', emailError);
      // Don't fail the application if email fails
    }

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

    const application = await AdoptionApplication.findById(req.params.id)
      .populate('petId', 'name breed age');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const pet = await Pet.findById(application.petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    // Update application
    application.status = status;
    application.reviewNotes = reviewNotes || application.reviewNotes;
    application.reviewedBy = req.user?._id;
    application.reviewedAt = new Date();
    await application.save();

    // Handle pet status based on application status
    if (status === 'approved') {
      // Update pet status to Unavailable
      pet.status = 'Unavailable';
      await pet.save();
      console.log(`✅ Pet ${pet.name} status updated to Unavailable (Adopted)`);

      // Send approval email with pickup details
      try {
        // Generate pickup details (3 days from now, 10 AM)
        const pickupDate = new Date();
        pickupDate.setDate(pickupDate.getDate() + 3);
        const formattedDate = pickupDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        });

        await sendAdoptionApprovalEmail(application.email, application.fullName, {
          petName: pet.name,
          petBreed: pet.breed,
          petAge: pet.age,
          pickupDate: formattedDate,
          pickupTime: '10:00 AM - 12:00 PM',
          pickupLocation: 'PetAdopt+ Adoption Center, 123 Main Street, City Center',
        });
        console.log(`✅ Approval email sent to ${application.email}`);
      } catch (emailError) {
        console.error('⚠️ Failed to send approval email:', emailError);
        // Don't fail the approval if email fails
      }
    } else if (status === 'rejected') {
      // Update pet status back to Available so others can apply
      pet.status = 'Available';
      await pet.save();
      console.log(`✅ Pet ${pet.name} status updated to Available (Application Rejected)`);
    }

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
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

    // If the application was pending, update pet status back to Available
    if (application.status === 'pending') {
      const pet = await Pet.findById(application.petId);
      if (pet && pet.status === 'Booked') {
        pet.status = 'Available';
        await pet.save();
        console.log(`✅ Pet ${pet.name} status updated to Available (Application Deleted)`);
      }
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

