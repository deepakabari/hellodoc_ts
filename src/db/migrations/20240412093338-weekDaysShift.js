'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Shift', 'weekDays');
        await queryInterface.addColumn('Shift', 'sunday', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
        await queryInterface.addColumn('Shift', 'monday', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
        await queryInterface.addColumn('Shift', 'tuesday', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
        await queryInterface.addColumn('Shift', 'wednesday', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
        await queryInterface.addColumn('Shift', 'thursday', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
        await queryInterface.addColumn('Shift', 'friday', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
        await queryInterface.addColumn('Shift', 'saturday', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
    },

    async down(queryInterface) {
        await queryInterface.addColumn('Shift', 'weekDays');
        await queryInterface.removeColumn('Shift', 'sunday');
        await queryInterface.removeColumn('Shift', 'monday');
        await queryInterface.removeColumn('Shift', 'tuesday');
        await queryInterface.removeColumn('Shift', 'wednesday');
        await queryInterface.removeColumn('Shift', 'thursday');
        await queryInterface.removeColumn('Shift', 'friday');
        await queryInterface.removeColumn('Shift', 'saturday');
    },
};
