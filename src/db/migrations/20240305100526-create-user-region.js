'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('UserRegion', {
            userId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'User',
                    key: 'id',
                },
            },
            regionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Region',
                    key: 'id',
                },
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });

        await queryInterface.addConstraint('UserRegion', {
            fields: ['userId', 'regionId'],
            type: 'unique',
            name: 'user_region_unique_constraint',
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('UserRegion');
    },
};
