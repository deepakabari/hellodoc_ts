'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('Region', [
            {
                name: 'Maryland',
                abbreviation: 'MD',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'New York',
                abbreviation: 'NY',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Virginia',
                abbreviation: 'VA',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'District of Columbia',
                abbreviation: 'DC',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('Region', null, {});
    },
};
