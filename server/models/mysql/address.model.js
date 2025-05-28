// models/mysql/Address.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/dbMySql.js";

import User from "./user.model.js";

const Address = sequelize.define("Address", {
  address_line: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  city: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  state: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  pincode: {
    type: DataTypes.STRING
  },
  country: {
    type: DataTypes.STRING
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

User.hasMany(Address, { foreignKey: "userId" });
Address.belongsTo(User, { foreignKey: "userId" });

export default Address;
