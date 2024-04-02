'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('Permission', [
            {
                name: 'Dashboard',
                accountType: 'Admin',
            },
            {
                name: 'Regions',
                accountType: 'Admin',
            },
            {
                name: 'Scheduling',
                accountType: 'Admin',
            },
            {
                name: 'History',
                accountType: 'Admin',
            },
            {
                name: 'Accounts',
                accountType: 'Admin',
            },
            {
                name: 'MyProfile',
                accountType: 'Admin',
            },
            {
                name: 'Role',
                accountType: 'Admin',
            },
            {
                name: 'Provider',
                accountType: 'Admin',
            },
            {
                name: 'RequestData',
                accountType: 'Admin',
            },
            {
                name: 'VendorsInfo',
                accountType: 'Admin',
            },
            {
                name: 'Profession',
                accountType: 'Admin',
            },
            {
                name: 'SendOrder',
                accountType: 'Admin',
            },
            {
                name: 'EmailLogs',
                accountType: 'Admin',
            },
            {
                name: 'HaloAdministration',
                accountType: 'Admin',
            },
            {
                name: 'HaloUsers',
                accountType: 'Admin',
            },
            {
                name: 'CancelledHistory',
                accountType: 'Admin',
            },
            {
                name: 'ProviderLocation',
                accountType: 'Admin',
            },
            {
                name: 'HaloEmployee',
                accountType: 'Admin',
            },
            {
                name: 'HaloWorkPlace',
                accountType: 'Admin',
            },
            {
                name: 'Chat',
                accountType: 'Admin',
            },
            {
                name: 'PatientRecords',
                accountType: 'Admin',
            },
            {
                name: 'BlockHistory',
                accountType: 'Admin',
            },
            {
                name: 'Invoicing',
                accountType: 'Admin',
            },
            {
                name: 'SMSLogs',
                accountType: 'Admin',
            },
            {
                name: 'Dashboard',
                accountType: 'Physician',
            },
            {
                name: 'MySchedule',
                accountType: 'Physician',
            },
            {
                name: 'MyProfile',
                accountType: 'Physician',
            },
            {
                name: 'SendOrder',
                accountType: 'Physician',
            },
            {
                name: 'Chat',
                accountType: 'Physician',
            },
            {
                name: 'Invoicing',
                accountType: 'Physician',
            },
            {
                name: 'MedicalHistory',
                accountType: 'User',
            },
            {
                name: 'MyProfile',
                accountType: 'User',
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('Permission', null, {});
    },
};
