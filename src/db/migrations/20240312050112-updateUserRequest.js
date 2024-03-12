"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("User", "notification", {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
        await queryInterface.addColumn("User", "businessName", {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn("User", "businessWebsite", {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn("Request", "isAgreementSent", {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
        });
        await queryInterface.addColumn("Request", "isAgreementAccepted", {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
        });
        
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("User", "notification")
        await queryInterface.removeColumn("User", "businessName")
        await queryInterface.removeColumn("User", "businessWebsite")
        await queryInterface.removeColumn("Request", "isAgreementSent")
        await queryInterface.removeColumn("Request", "isAgreementAccepted")
    },
};
