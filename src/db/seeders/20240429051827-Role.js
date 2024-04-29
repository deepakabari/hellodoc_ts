'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('Role', [
            {
                Name: 'Master Admin',
                accountType: 'Admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                Name: 'Physician',
                accountType: 'Physician',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('Role', null, {});
    },
};
