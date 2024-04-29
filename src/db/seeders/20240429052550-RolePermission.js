'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('RolePermissionMap', [
            {
                roleId: 1,
                permissionId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 3,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 4,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 6,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 7,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 8,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 9,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 11,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 12,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 13,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 17,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 20,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 21,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 22,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 23,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 1,
                permissionId: 24,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 2,
                permissionId: 25,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 2,
                permissionId: 26,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 2,
                permissionId: 27,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 2,
                permissionId: 28,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 2,
                permissionId: 29,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 2,
                permissionId: 30,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('RolePermissionMap', null, {});
    },
};
