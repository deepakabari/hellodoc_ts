'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PayRate', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            physicianId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            nightShiftWeekend: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            shift: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            houseCallNightWeekend: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            phoneConsult: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            phoneConsultNightWeekend: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            batchTesting: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            houseCall: {
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
        await queryInterface.dropTable('PayRate');
    },
};
