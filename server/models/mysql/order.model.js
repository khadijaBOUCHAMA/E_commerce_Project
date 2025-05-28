import { DataTypes } from "sequelize";
import sequelize from "../../config/dbMySql.js";

import User from "./user.model.js";
import Address from "./address.model.js";

const Order = sequelize.define("Order", {
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  paymentId: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  product_details: {
    type: DataTypes.JSON // pour stocker name, image[] etc.
  },
  subTotalAmt: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  totalAmt: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  invoice_receipt: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  delivery_address: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Addresses', // nom exact de la table
      key: 'id'
    }
  }
}, {
  timestamps: true
});

// Relations
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Address.hasMany(Order, { foreignKey: "delivery_address" });
Order.belongsTo(Address, { as: 'address', foreignKey: 'delivery_address' });

export default Order;
