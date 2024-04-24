'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('User', 'phoneType', {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: 'Mobile',
            after: 'lastName',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('User', 'phoneType');
    },
};
