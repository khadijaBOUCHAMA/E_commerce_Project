import { DataTypes } from "sequelize";
import sequelize from "../../config/dbMySql.js";

import User from "./user.model.js";

const CartProduct = sequelize.define("CartProduct", {
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  productId: {
    type: DataTypes.STRING, // car l’ID vient de MongoDB (souvent un ObjectId sous forme de string)
    allowNull: false
  },
  product_details: {
    type: DataTypes.JSON // pour stocker les détails du produit MongoDB
  }
}, {
  timestamps: true
});

// Relations
User.hasMany(CartProduct, { foreignKey: "userId" });
CartProduct.belongsTo(User, { foreignKey: "userId" });

export default CartProduct;
