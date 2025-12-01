'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('profiles', [
            {
                user_id: 1,
                profile_type: 'consumer',
                bio: 'Love shopping and discovering new products nearby!',
                profile_image: null,
                address: 'Nairobi, Kenya',
                phone: '+254712345001',
                availability_status: 'available',
                completion_percentage: 100,
                is_complete: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                user_id: 2,
                profile_type: 'seller',
                business_name: 'Tech Hub Kenya',
                business_category: 'Electronics',
                bio: 'Premium electronics and gadgets retailer',
                profile_image: null,
                address: 'Nairobi, Kenya',
                phone: '+254712345002',
                availability_status: 'available',
                product_count: 3,
                completion_percentage: 100,
                is_complete: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                user_id: 3,
                profile_type: 'provider',
                service_name: 'Expert Plumbing Services',
                profession_category: 'Plumbing',
                experience_years: 8,
                bio: 'Professional plumbing services with 8 years of experience',
                profile_image: null,
                address: 'Nairobi, Kenya',
                phone: '+254712345003',
                availability_status: 'available',
                portfolio_count: 0,
                completion_percentage: 100,
                is_complete: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                user_id: 2,
                profile_type: 'consumer',
                bio: 'Also a consumer profile for Bob',
                profile_image: null,
                address: 'Nairobi, Kenya',
                phone: '+254712345002',
                availability_status: 'available',
                completion_percentage: 50,
                is_complete: false,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                user_id: 3,
                profile_type: 'consumer',
                bio: 'Also a consumer profile for Charlie',
                profile_image: null,
                address: 'Nairobi, Kenya',
                phone: '+254712345003',
                availability_status: 'available',
                completion_percentage: 50,
                is_complete: false,
                created_at: new Date(),
                updated_at: new Date()
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('profiles', null, {});
    }
};
