'use strict';
const bcrypt = require('bcrypt');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const hash = await bcrypt.hash('password', 10);
        await queryInterface.bulkInsert('users', [
            {
                name: 'Alice Johnson',
                phone: '+254712345001',
                password_hash: hash,
                address: 'Nairobi, Kenya',
                latitude: -1.2921,
                longitude: 36.8219,
                email: 'alice@freemart.local',
                current_profile_mode: 'consumer',
                consumer_profile_active: true,
                seller_profile_active: false,
                provider_profile_active: false,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                name: 'Bob Smith',
                phone: '+254712345002',
                password_hash: hash,
                address: 'Nairobi, Kenya',
                latitude: -1.2921,
                longitude: 36.8219,
                email: 'bob@freemart.local',
                current_profile_mode: 'seller',
                consumer_profile_active: true,
                seller_profile_active: true,
                provider_profile_active: false,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                name: 'Charlie Brown',
                phone: '+254712345003',
                password_hash: hash,
                address: 'Nairobi, Kenya',
                latitude: -1.3000,
                longitude: 36.8300,
                email: 'charlie@freemart.local',
                current_profile_mode: 'provider',
                consumer_profile_active: true,
                seller_profile_active: false,
                provider_profile_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('users', null, {});
    }
};
