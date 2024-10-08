'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Role', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            Name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            accountType: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            isDeleted: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('Role');
    },
};
