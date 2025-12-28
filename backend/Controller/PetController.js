import Pet from '../model/Petmodel.js';

// @desc    Get all pets
// @route   GET /api/pets
// @access  Public
export const getAllPets = async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status === 'available' ? 'Available' : 'Unavailable';
    }

    const pets = await Pet.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: pets.length,
      data: pets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pets',
      error: error.message,
    });
  }
};

// @desc    Get single pet by ID
// @route   GET /api/pets/:id
// @access  Public
export const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    res.status(200).json({
      success: true,
      data: pet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pet',
      error: error.message,
    });
  }
};

// @desc    Create new pet
// @route   POST /api/pets
// @access  Private/Admin
export const createPet = async (req, res) => {
  try {
    const { name, type, breed, age, gender, status, description, image, size, vaccinated, vaccinations, inShelter } = req.body;

    // Validation
    if (!name || !breed || !age) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, breed, and age',
      });
    }

    const pet = await Pet.create({
      name,
      type,
      breed,
      age,
      gender,
      status,
      description,
      image,
      size,
      vaccinated,
      vaccinations,
      inShelter,
      addedBy: req.user?._id, // If you have auth middleware
    });

    res.status(201).json({
      success: true,
      message: 'Pet added successfully',
      data: pet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating pet',
      error: error.message,
    });
  }
};

// @desc    Update pet
// @route   PUT /api/pets/:id
// @access  Private/Admin
export const updatePet = async (req, res) => {
  try {
    const { name, type, breed, age, gender, status, description, image, size, vaccinated, vaccinations, inShelter } = req.body;

    let pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    // Update fields
    pet.name = name || pet.name;
    pet.type = type || pet.type;
    pet.breed = breed || pet.breed;
    pet.age = age || pet.age;
    pet.gender = gender || pet.gender;
    pet.status = status || pet.status;
    pet.description = description || pet.description;
    pet.image = image || pet.image;
    if (size !== undefined) pet.size = size;
    if (vaccinated !== undefined) pet.vaccinated = vaccinated;
    if (vaccinations !== undefined) pet.vaccinations = vaccinations;
    if (inShelter !== undefined) pet.inShelter = inShelter;

    await pet.save();

    res.status(200).json({
      success: true,
      message: 'Pet updated successfully',
      data: pet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating pet',
      error: error.message,
    });
  }
};

// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private/Admin
export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    await pet.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Pet deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting pet',
      error: error.message,
    });
  }
};