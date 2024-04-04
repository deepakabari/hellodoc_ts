'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('RolePermissionMap', {
            roleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Role',
                    key: 'id',
                },
            },
            permissionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Permission',
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

        await queryInterface.addConstraint('RolePermissionMap', {
            fields: ['roleId', 'permissionId'],
            type: 'unique',
            name: 'role_permission_unique_constraint',
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('RolePermissionMap');
    },
};
