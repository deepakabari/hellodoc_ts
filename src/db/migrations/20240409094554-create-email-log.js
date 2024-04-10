'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('EmailLog', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            confirmationNumber: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            senderId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            receiverId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            sentDate: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            isEmailSent: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            sentTries: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            action: {
                type: Sequelize.STRING,
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
                allowNull: true,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('EmailLog');
    },
};
