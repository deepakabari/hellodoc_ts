'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('timesheetDetail', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            timesheetId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            onCallHours: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            totalHours: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            houseCall: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            phoneConsult: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            item: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            amount: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            bill: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            isHoliday: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            numberOfShifts: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            nightShiftWeekend: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            phoneConsultNightWeekend: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            houseCallNightWeekend: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            batchTesting: {
                type: Sequelize.INTEGER,
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
        await queryInterface.dropTable('timesheetDetail');
    },
};
