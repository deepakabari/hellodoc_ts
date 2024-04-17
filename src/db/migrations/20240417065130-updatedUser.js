'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
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
        await queryInterface.removeColumn('User', 'notes');
        await queryInterface.removeColumn('RequestWiseFiles', 'userId');
    },
};
