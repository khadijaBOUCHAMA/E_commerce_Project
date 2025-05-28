import AddressModel from "../models/mysql/address.model.js";
import UserModel from "../models/mysql/user.model.js";

export const addAddressController = async (request, response) => {
  try {
    const userId = request.userId; // middleware

    const { address_line, city, state, pincode, country, mobile } = request.body;

    // Création de l'adresse avec Sequelize
    const saveAddress = await AddressModel.create({
      address_line,
      city,
      state,
      country,
      pincode,
      mobile,
      userId,
      status: true,
    });

    // Optionnel: si tu veux mettre à jour la liste des adresses dans User (si champ ou relation à gérer)
    // Par exemple, avec une association Sequelize, pas besoin de push manuel dans un tableau.

    return response.json({
      message: "Address Created Successfully",
      error: false,
      success: true,
      data: saveAddress,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getAddressController = async (request, response) => {
  try {
    const userId = request.userId; // middleware auth

    // Récupérer les adresses de l'utilisateur triées par date décroissante
    const data = await AddressModel.findAll({
      where: { userId, status: true },
      order: [["createdAt", "DESC"]],
    });

    return response.json({
      data,
      message: "List of address",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const updateAddressController = async (request, response) => {
  try {
    const userId = request.userId; // middleware auth
    const { id, address_line, city, state, country, pincode, mobile } = request.body;

    // Met à jour l'adresse pour cet utilisateur
    const [updatedCount] = await AddressModel.update(
      {
        address_line,
        city,
        state,
        country,
        pincode,
        mobile,
      },
      {
        where: {
          id,
          userId,
          status: true,
        },
      }
    );

    if (updatedCount === 0) {
      return response.status(404).json({
        message: "Address not found or no changes made",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Address Updated",
      error: false,
      success: true,
      data: { updatedCount },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Route : DELETE /api/address/disable/:id
export const deleteAddressController = async (request, response) => {
  try {
    const userId = request.userId;
    const id = request.params.id;

    if (!id) {
      return response.status(400).json({
        message: "Address ID is required",
        error: true,
        success: false,
      });
    }

    const [updatedCount] = await AddressModel.update(
      { status: false },
      {
        where: { id, userId, status: true },
      }
    );

    if (updatedCount === 0) {
      return response.status(404).json({
        message: "Address not found or already removed",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Address removed",
      error: false,
      success: true,
      data: { updatedCount },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};



