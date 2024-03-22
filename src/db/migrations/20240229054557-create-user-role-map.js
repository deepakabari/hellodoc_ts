'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('UserRoleMap', {
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'User', // name of your User table
                    key: 'id',
                },
            },
            roleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Role', // name of your Role table
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

        // Adding unique constraint on userId and roleId
        await queryInterface.addConstraint('UserRoleMap', {
            fields: ['userId', 'roleId'],
            type: 'unique',
            name: 'user_role_unique_constraint',
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('UserRoleMap');
    },
};
