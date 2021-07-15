const merge = require('deepmerge');
const { serialized: createUser } = require('#test/utils/user');

module.exports = {
    serialized(override = {}) {
        const defaultPlan = {
            id: 2,
            name: 'Dispositif',
            started_at: (new Date(2020, 0, 1, 0, 0, 0)).getTime(),
            expected_to_end_at: (new Date(2022, 0, 1, 0, 0, 0)).getTime(),
            closed_at: null,
            updated_at: null,
            in_and_out: true,
            goals: 'Objectif de dispositif',
            location_type: {
                id: 'housing',
                label: 'sur terrain d\'insertion',
            },
            location_details: null,
            final_comment: null,
            government_contacts: [
                createUser(),
            ],
            departement: {
                code: '78',
                name: 'Yvelines',
            },
            region: {
                code: '11',
                name: 'Île-de-France',
            },
            operator_contacts: [
                createUser(),
            ],
            states: [],
            topics: [{
                uid: 'health',
                name: 'Santé',
            }],
            createdBy: 2,
            updatedBy: null,
        };

        return merge(defaultPlan, override);
    },
};