import CartProductModel from "../models/mysql/cartproduct.model.js";
import UserModel from "../models/mysql/user.model.js";
import ProductModelMongo from "../models/mongo/product.model.js"; // ton modèle Mongo

export const addToCartItemController = async (request, response) => {
  try {
    console.log("Request body received:", request.body);
    console.log("User ID:", request.userId);

    const userId = request.userId;
    const { productId } = request.body;

    if (!productId) {
      return response.status(400).json({
        message: "Provide productId",
        error: true,
        success: false,
      });
    }

    // Vérifier si l'item est déjà dans le panier
    const checkItemCart = await CartProductModel.findOne({
      where: {
        userId,
        productId,
      },
    });

    if (checkItemCart) {
  checkItemCart.quantity += 1; // ou qty reçue
  await checkItemCart.save();

  return response.json({
    message: "Quantity updated in cart",
    error: false,
    success: true,
    data: checkItemCart,
  });
}


    // Créer l'item dans le panier
    const save = await CartProductModel.create({
      quantity: 1,
      userId,
      productId,
    });

    return response.json({
      data: save,
      message: "Item added successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error in addToCartItemController:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getCartItemController = async (req, res) => {
  try {
    const userId = req.userId;

    // Récupérer le panier depuis MySQL
    const cartItems = await CartProductModel.findAll({
      where: { userId }
    });

    // Pour chaque item, récupérer les détails produit depuis MongoDB
    const detailedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        const productDetails = await ProductModelMongo.findById(item.productId);
        return {
          ...item.toJSON(),
          product_details: productDetails // ajoute les détails produits
        };
      })
    );

    res.json({
      success: true,
      error: false,
      data: detailedCartItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message
    });
  }
};


export const updateCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId;
    const { id, qty } = request.body;

    if (!id || qty === undefined) {
      return response.status(400).json({
        message: "Provide id and qty",
        error: true,
        success: false,
      });
    }

    const [updatedCount] = await CartProductModel.update(
      { quantity: qty },
      {
        where: {
          id,
          userId,
        },
      }
    );

    if (updatedCount === 0) {
      return response.status(404).json({
        message: "Cart item not found or no changes made",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Cart updated",
      success: true,
      error: false,
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

export const deleteCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId;
    const { id } = request.body;

    if (!id) {
      return response.status(400).json({
        message: "Provide id",
        error: true,
        success: false,
      });
    }

    const deletedCount = await CartProductModel.destroy({
      where: {
        id,
        userId,
      },
    });

    if (deletedCount === 0) {
      return response.status(404).json({
        message: "Item not found or already deleted",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Item removed",
      error: false,
      success: true,
      data: { deletedCount },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
