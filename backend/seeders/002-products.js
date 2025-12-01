'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('products', [
            { title: 'Bag of Rice', images: JSON.stringify([]), description: 'Good quality rice', category: 'Food', price: 12.50, seller_id: 2, stock: 20, created_at: new Date(), updated_at: new Date() }
        ], {});
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('products', null, {});
    }
};
