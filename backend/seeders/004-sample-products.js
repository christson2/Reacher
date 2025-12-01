'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('products', [
            {
                seller_id: 2,
                title: 'iPhone 14 Pro',
                category: 'Electronics',
                description: 'Latest iPhone 14 Pro with advanced camera system and A16 chip',
                price: 129999,
                stock: 5,
                images: JSON.stringify([
                    'https://via.placeholder.com/300x300?text=iPhone14+Pro'
                ]),
                latitude: -1.2921,
                longitude: 36.8219,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                seller_id: 2,
                title: 'Samsung Galaxy S23',
                category: 'Electronics',
                description: 'Flagship Android phone with 5G support and superior display',
                price: 99999,
                stock: 10,
                images: JSON.stringify([
                    'https://via.placeholder.com/300x300?text=Samsung+S23'
                ]),
                latitude: -1.2921,
                longitude: 36.8219,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                seller_id: 2,
                title: 'Apple AirPods Pro',
                category: 'Electronics',
                description: 'Wireless earbuds with active noise cancellation and spatial audio',
                price: 29999,
                stock: 20,
                images: JSON.stringify([
                    'https://via.placeholder.com/300x300?text=AirPods+Pro'
                ]),
                latitude: -1.2921,
                longitude: 36.8219,
                created_at: new Date(),
                updated_at: new Date()
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('products', null, {});
    }
};

