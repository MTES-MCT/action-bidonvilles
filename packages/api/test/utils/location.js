const merge = require('deepmerge');

module.exports = {
    district(override = {}) {
        return merge({
            type: 'city',
            region: {
                name: 'Île-de-France',
                code: '11',
            },
            departement: {
                name: 'Hauts-de-Seine',
                code: '92',
            },
            epci: {
                name: 'Métropole du Grand Paris',
                code: '200054781',
            },
            city: {
                name: 'Paris 1er Arrondissement',
                code: '75101',
                main: '75056',
            },
        }, override);
    },

    city(override = {}) {
        return merge({
            type: 'city',
            region: {
                name: 'Île-de-France',
                code: '11',
            },
            departement: {
                name: 'Hauts-de-Seine',
                code: '92',
            },
            epci: {
                name: 'Métropole du Grand Paris',
                code: '200054781',
            },
            city: {
                name: 'Paris',
                code: '75056',
                main: null,
            },
        }, override);
    },

    epci(override = {}) {
        return merge({
            type: 'epci',
            region: {
                name: 'Île-de-France',
                code: '11',
            },
            departement: {
                name: 'Hauts-de-Seine',
                code: '92',
            },
            epci: {
                name: 'Métropole du Grand Paris',
                code: '200054781',
            },
            city: null,
        }, override);
    },

    departement(override = {}) {
        return merge({
            type: 'departement',
            region: {
                name: 'Île-de-France',
                code: '11',
            },
            departement: {
                name: 'Hauts-de-Seine',
                code: '92',
            },
            epci: null,
            city: null,
        }, override);
    },

    region(override = {}) {
        return merge({
            type: 'region',
            region: {
                name: 'Île-de-France',
                code: '11',
            },
            departement: null,
            epci: null,
            city: null,
        }, override);
    },

    nation() {
        return {
            type: 'nation',
            region: null,
            departement: null,
            epci: null,
            city: null,
        };
    },
};