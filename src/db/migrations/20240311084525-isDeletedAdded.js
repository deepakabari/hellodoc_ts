'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('RequestWiseFiles', 'documentPath', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('RequestWiseFiles', 'isDeleted', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
        await queryInterface.addColumn('User', 'isDeleted', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('RequestWiseFiles', 'documentPath');
        await queryInterface.removeColumn('RequestWiseFiles', 'isDeleted');
        await queryInterface.removeColumn('User', 'isDeleted');
    },
};
