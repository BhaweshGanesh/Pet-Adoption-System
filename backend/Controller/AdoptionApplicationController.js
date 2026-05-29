import AdoptionApplication from '../model/AdoptionApplicationmodel.js';
import Pet from '../model/Petmodel.js';
import { sendAdoptionConfirmationEmail, sendAdoptionApprovalEmail, sendAdoptionRejectionEmail } from '../utils/emailService.js';

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

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    if (pet.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'This pet is not available for adoption at this time.',
      });
    }

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
      userId: req.user?._id,
    });

    pet.status = 'Booked';
    await pet.save();
    console.log(`Pet ${pet.name} status updated to Booked`);

    try {
      await sendAdoptionConfirmationEmail(email, fullName, {
        petName: petName || pet.name,
        petBreed: pet.breed,
        petAge: pet.age,
        applicationDate: application.createdAt,
        status: application.status,
      });
      console.log(`Adoption confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error(' Failed to send adoption confirmation email:', emailError);
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

    application.status = status;
    application.reviewNotes = reviewNotes || application.reviewNotes;
    application.reviewedBy = req.user?._id;
    application.reviewedAt = new Date();
    await application.save();

    if (status === 'approved') {
      pet.status = 'Unavailable';
      await pet.save();
      console.log(`Pet ${pet.name} status updated to Unavailable (Adopted)`);

      try {
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
        console.log(`Approval email sent to ${application.email}`);
      } catch (emailError) {
        console.error(' Failed to send approval email:', emailError);
      }
    } else if (status === 'rejected') {
      pet.status = 'Available';
      await pet.save();
      console.log(`Pet ${pet.name} status updated to Available (Application Rejected)`);

      try {
        await sendAdoptionRejectionEmail(application.email, application.fullName, {
          petName: pet.name,
          petBreed: pet.breed,
          petAge: pet.age,
          reviewNotes: reviewNotes || 'Thank you for your interest. Please browse other available pets.',
        });
        console.log(`Rejection email sent to ${application.email}`);
      } catch (emailError) {
        console.error('⚠️ Failed to send rejection email:', emailError);
      }
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

export const deleteApplication = async (req, res) => {
  try {
    const application = await AdoptionApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.status === 'pending') {
      const pet = await Pet.findById(application.petId);
      if (pet && pet.status === 'Booked') {
        pet.status = 'Available';
        await pet.save();
        console.log(`Pet ${pet.name} status updated to Available (Application Deleted)`);
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

export const getMyAdoptions = async (req, res) => {
  try {
    console.log('[getMyAdoptions] Request received');
    console.log('User:', req.user ? `${req.user.fullName} (${req.user.email})` : 'No user');

    if (!req.user) {
      console.log('[getMyAdoptions] No user found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const applications = await AdoptionApplication.find({
      $or: [
        { userId: req.user._id },
        { email: req.user.email }
      ]
    })
      .populate('petId', 'name type breed image age gender color')
      .populate('reviewedBy', 'fullName')
      .sort({ createdAt: -1 });

    console.log(`[getMyAdoptions] Found ${applications.length} applications`);

    const adoptionHistory = {
      approved: applications.filter(app => app.status === 'approved'),
      pending: applications.filter(app => app.status === 'pending'),
      rejected: applications.filter(app => app.status === 'rejected'),
      withdrawn: applications.filter(app => app.status === 'withdrawn'),
      all: applications
    };

    console.log('[getMyAdoptions] Response sent successfully');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: adoptionHistory,
    });
  } catch (error) {
    console.error('[getMyAdoptions] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching adoption history',
      error: error.message,
    });
  }
};