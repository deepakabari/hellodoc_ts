'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('MedicalReport', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            requestId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Request',
                    key: 'id',
                },
            },
            serviceDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            presentIllnessHistory: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            medicalHistory: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            medications: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            allergies: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            temperature: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            heartRate: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            repositoryRate: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            sisBP: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            diaBP: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            oxygen: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            pain: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            heent: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            cv: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            chest: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            abd: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            extr: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            skin: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            neuro: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            other: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            diagnosis: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            treatmentPlan: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            medicationDispensed: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            procedure: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            followUp: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            isFinalize: {
                type: Sequelize.BOOLEAN,
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
        await queryInterface.dropTable('MedicalReport');
    },
};
