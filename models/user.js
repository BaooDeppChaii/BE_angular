const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
   phone: {
  type: DataTypes.STRING,
  allowNull: true
},
address: {
  type: DataTypes.STRING,
  allowNull: true
},
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: true,
           defaultValue: '0',
    },
    active: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: '1',
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

module.exports = User;
