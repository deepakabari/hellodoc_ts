'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('weeklyTimesheet', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            startDate: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            endDate: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            status: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            physicianId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            payRateId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            adminId: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            isFinalize: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
            adminNote: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            totalAmount: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            bonusAmount: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('weeklyTimesheet');
    },
};
