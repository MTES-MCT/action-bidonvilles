module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(
        transaction => queryInterface.addColumn(
            'features',
            'write',
            {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            {
                transaction,
            },
        )
            .then(() => Promise.all([
                queryInterface.sequelize.query(
                    'UPDATE features SET write = TRUE WHERE name NOT IN (:names)',
                    {
                        transaction,
                        replacements: {
                            names: ['listPrivate', 'export', 'read', 'list', 'access'],
                        },
                    },
                ),
                queryInterface.sequelize.query(
                    'UPDATE features SET write = FALSE WHERE name IN (:names)',
                    {
                        transaction,
                        replacements: {
                            names: ['listPrivate', 'export', 'read', 'list', 'access'],
                        },
                    },
                ),
            ]))
            .then(() => queryInterface.changeColumn(
                'features',
                'write',
                {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                },
                {
                    transaction,
                },
            )),
    ),

    down: queryInterface => queryInterface.sequelize.transaction(
        transaction => queryInterface.removeColumn('features', 'write', { transaction }),
    ),

};
