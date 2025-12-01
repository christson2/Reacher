'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('reviews', [
            {
                reviewer_id: 1,
                target_user_id: 2,
                rating: 5,
                comment: 'Excellent service! Very responsive and professional.',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                reviewer_id: 1,
                target_user_id: 3,
                rating: 4,
                comment: 'Good work, fixed my plumbing issue quickly.',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                reviewer_id: 2,
                target_user_id: 1,
                rating: 5,
                comment: 'Great buyer, reliable and friendly!',
                created_at: new Date(),
                updated_at: new Date()
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('reviews', null, {});
    }
};
