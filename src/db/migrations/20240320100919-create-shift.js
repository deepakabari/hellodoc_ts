'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('shift', {
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
            shiftDate: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            region: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            startTime: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            endTime: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            isRepeat: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
            weekDays: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            repeatUpto: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            isApproved: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            isDeleted: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: false,
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
                allowNull: true,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('shift');
    },
};
