'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('Profession', [
            {
                name: 'Test',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Wellness',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Medical',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Cardiologist',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Neurologist',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('Profession', null, {});
    },
};
