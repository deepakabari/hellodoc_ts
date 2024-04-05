'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('User', 'stopNotification', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
        await queryInterface.addColumn('Request', 'isAgreementSent', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
        await queryInterface.addColumn('Request', 'isAgreementAccepted', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('User', 'stopNotification');
        await queryInterface.removeColumn('Request', 'isAgreementSent');
        await queryInterface.removeColumn('Request', 'isAgreementAccepted');
    },
};
