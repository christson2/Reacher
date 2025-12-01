'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('services', [
            {
                provider_id: 3,
                name: 'Emergency Plumbing Repair',
                skill_category: 'Plumbing',
                description: 'Fast and reliable emergency plumbing services available 24/7',
                pricing_info: JSON.stringify({ hourly_rate: 2000, currency: 'KES' }),
                latitude: -1.3000,
                longitude: 36.8300,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                provider_id: 3,
                name: 'Pipe Installation',
                skill_category: 'Plumbing',
                description: 'Professional pipe installation and maintenance services',
                pricing_info: JSON.stringify({ hourly_rate: 1500, currency: 'KES' }),
                latitude: -1.3000,
                longitude: 36.8300,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                provider_id: 3,
                name: 'Water Tank Cleaning',
                skill_category: 'Plumbing',
                description: 'Thorough water tank cleaning and disinfection',
                pricing_info: JSON.stringify({ hourly_rate: 1200, currency: 'KES' }),
                latitude: -1.3000,
                longitude: 36.8300,
                created_at: new Date(),
                updated_at: new Date()
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('services', null, {});
    }
};
