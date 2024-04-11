'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Business', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            accountType: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            businessName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            businessWebsite: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            profession: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            faxNumber: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            phoneNumber: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            businessContact: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            street: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            city: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            state: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            zipCode: {
                type: Sequelize.STRING,
                allowNull: false,
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
        await queryInterface.dropTable('Business');
    },
};
