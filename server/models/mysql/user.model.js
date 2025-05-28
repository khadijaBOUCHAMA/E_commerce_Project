// models/mysql/User.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/dbMySql.js";
 // ton fichier de connexion MySQL

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  mobile: {
    type: DataTypes.STRING, // string pour supporter les indicatifs
    allowNull: true
  },
  refresh_token: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  verify_email: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_login_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("Active", "Inactive", "Suspended"),
    defaultValue: "Active"
  },
  forgot_password_otp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  forgot_password_expiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM("ADMIN", "USER"),
    defaultValue: "USER"
  }
}, {
  timestamps: true
});

export default User;
