"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Request", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            requestType: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            patientFirstName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            patientLastName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            patientPhoneNumber: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            dob: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            patientEmail: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.INTEGER,
                allowNull: false,
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
            roomNumber: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            patientNote: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            documentPhoto: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            physicianId: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            requestorFirstName: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            requestorLastName: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            requestorPhoneNumber: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            requestorEmail: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            confirmationNumber: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            isDeleted: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            declinedBy: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            isUrgentEmailSent: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            lastWellnessDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            callType: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            completedByPhysician: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            lastReservationDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            acceptedDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            relationName: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            caseNumber: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            caseTag: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            caseTagPhysician: {
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
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Request");
    },
};
