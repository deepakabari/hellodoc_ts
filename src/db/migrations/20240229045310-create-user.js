'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('User', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            userName: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            firstName: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            lastName: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            phoneNumber: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            dob: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            address1: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            address2: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            street: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            city: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            state: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            zipCode: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            altPhone: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            accountType: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            medicalLicense: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            photo: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            signature: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            isAgreementDoc: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            isBackgroundDoc: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            isTrainingDoc: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            isNonDisclosureDoc: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            isLicenseDoc: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            NPINumber: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            syncEmailAddress: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            resetToken: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            expireToken: {
                type: Sequelize.DATE,
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
        await queryInterface.dropTable('User');
    },
};
