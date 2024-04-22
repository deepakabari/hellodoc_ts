'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('User', 'createdBy', {
            type: Sequelize.INTEGER,
            allowNull: true,
            after: 'syncEmailAddress',
        });
        await queryInterface.addColumn('User', 'notes', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'accountType',
        });
        await queryInterface.addColumn('RequestWiseFiles', 'userId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            after: 'requestId',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('User', 'createdBy');
        await queryInterface.removeColumn('User', 'notes');
        await queryInterface.removeColumn('RequestWiseFiles', 'userId');
    },
};
