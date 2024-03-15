"use strict";
/** @type {import('sequelize-cli').Migration} */
const bcrypt = require("bcrypt")
module.exports = {
    async up(queryInterface, Sequelize) {
        const users = [
            {
                userName: "admin1",
                email: "admin123@yopmail.com",
                password: "Password@123",
                firstName: "admin1",
                lastName: "test",
                status: "Active",
                phoneNumber: "9876543210",
                dob: "2000-02-29",
                address1: "220 B",
                address2: "Upper Marlboro",
                city: "Maryland",
                state: "Maryland",
                zipCode: "63556",
                altPhone: "9638527410",
                accountType: "Admin",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                userName: "admin2",
                email: "admin456@yopmail.com",
                password: "Password@123",
                firstName: "admin2",
                lastName: "test",
                status: "Active",
                phoneNumber: "9637418520",
                dob: "2000-02-29",
                address1: "251 E",
                address2: "Upper Mexican",
                city: "Virginia",
                state: "Virginia",
                zipCode: "45835",
                altPhone: "9516237420",
                accountType: "Admin",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];
        const hashedUsers = await Promise.all(
            users.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 12);
                return { ...user, password: hashedPassword };
            })
        );
        return await queryInterface.bulkInsert("User", hashedUsers, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("User", null, {});
    },
};
