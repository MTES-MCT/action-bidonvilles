const merge = require('deepmerge');

module.exports = {
    serialized(override = {}) {
        const defaultUser = {
            id: 2,
            first_name: 'Jean',
            last_name: 'Dupont',
            email: 'jean.dupont@gouv.fr',
            phone: '0611223344',
            position: 'Mock',
            status: 'active',
            created_at: (new Date(2020, 0, 1, 0, 0, 0)).getTime() / 1000,
            user_access: {
                id: 2,
                sent_by: {
                    id: 1,
                    first_name: 'Pierre',
                    last_name: 'Untel',
                    email: 'pierre.untel@gouv.fr',
                    position: 'Mock',
                    organization: {
                        id: 1,
                        name: 'Délégation Interministérielle à l\'Hébergement et à l\'Accès au Logement',
                    },
                },
                created_at: (new Date(2020, 0, 1, 1, 0, 0)).getTime() / 1000,
                expires_at: (new Date(2020, 0, 8, 1, 0, 0)).getTime() / 1000,
                used_at: (new Date(2020, 0, 1, 2, 0, 0)).getTime() / 1000,
            },
            organization: {
                id: 2,
                name: 'Délégation Interministérielle à l\'Hébergement et à l\'Accès au Logement',
                abbreviation: 'DIHAL',
                active: true,
                type: {
                    id: 10,
                    name_singular: 'Délégation interministérielle',
                    name_plural: 'Délégations interministérielles',
                    abbreviation: null,
                },
                category: {
                    uid: 'administration',
                    name_singular: 'Administration centrale',
                    name_plural: 'Administrations centrales',
                },
                location: {
                    type: 'nation',
                    latitude: 46.7755829,
                    longitude: 2.0497727,
                    region: null,
                    departement: null,
                    epci: null,
                    city: null,
                },
            },
            charte_engagement_a_jour: true,
            is_admin: false,
            role: 'Acteur national',
            role_id: 'national_establisment',
            is_superuser: false,
            access_request_message: 'Demande d\'accès pour tests automatisés',
            default_export: [],
            permissions: {
                shantytown: {
                    create: { allowed: true, geographic_level: 'nation', data_justice: true },
                    list: { allowed: true, geographic_level: 'nation', data_justice: true },
                    read: { allowed: true, geographic_level: 'nation', data_justice: true },
                    update: { allowed: true, geographic_level: 'nation', data_justice: true },
                    close: { allowed: true, geographic_level: 'nation', data_justice: true },
                    export: { allowed: true, geographic_level: 'nation', data_justice: true },
                },
                shantytown_comment: {
                    create: { allowed: true, geographic_level: 'nation' },
                    createPrivate: { allowed: true, geographic_level: 'nation' },
                    list: { allowed: true, geographic_level: 'nation' },
                    listPrivate: { allowed: true, geographic_level: 'nation' },
                },
                plan: {
                    create: { allowed: true, geographic_level: 'nation', data_finances: true },
                    list: { allowed: true, geographic_level: 'nation', data_finances: true },
                    read: { allowed: true, geographic_level: 'nation', data_finances: true },
                    update: { allowed: true, geographic_level: 'own', data_finances: true },
                    updateMarks: { allowed: true, geographic_level: 'own', data_finances: true },
                    close: { allowed: true, geographic_level: 'own', data_finances: true },
                },
                user: {},
                stats: {},
                plan_finances: {
                    access: { allowed: true, geographic_level: 'nation' },
                },
                covid_comment: {
                    list: { allowed: true, geographic_level: 'nation' },
                },
            },
            permission_options: [],
            last_version: '0.0.0',
            last_changelog: '0.0.0',
        };

        return merge(defaultUser, override);
    },
};
