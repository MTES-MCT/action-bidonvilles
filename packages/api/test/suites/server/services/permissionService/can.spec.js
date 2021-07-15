const { expect } = require('chai');
const { can } = require('#server/services/permissionService');
const location = require('#test/utils/location');
const { serialized: createUser } = require('#test/utils/user');
const { serialized: createPlan } = require('#test/utils/plan');

describe.only('PermissionService', () => {
    describe('.can(user).do(feature, entity).on(location)', () => {
        it('Si l\'utilisateur n\'est pas défini, retourne false', () => {
            expect(
                can(undefined).do('list', 'shantytown').on(location.city()),
            ).to.be.false;
        });

        it('Si l\'utilisateur n\'a pas de permissions définies, retourne false', () => {
            expect(
                can(createUser({ permissions: undefined })).do('list', 'shantytown').on(location.city()),
            ).to.be.false;
        });

        it('Si l\'utilisateur n\'a pas de permissions pour l\'entité demandée, retourne false', () => {
            expect(
                can(createUser()).do('list', 'whatever').on(location.city()),
            ).to.be.false;
        });

        it('Si l\'utilisateur n\'a pas de permissions pour la feature demandée, retourne false', () => {
            expect(
                can(createUser()).do('whatever', 'shantytown').on(location.city()),
            ).to.be.false;
        });

        it('Si la permission est allowed=false pour l\'utilisateur, retourne false', () => {
            expect(
                can(createUser({
                    permissions: { shantytown: { list: { allowed: false, write: false } } },
                })).do('list', 'shantytown').on(location.city()),
            ).to.be.false;
        });

        it('Si la permission est autorisée au niveau national, retourne true', () => {
            expect(
                can(createUser()).do('list', 'shantytown').on(location.nation()),
            ).to.be.true;
        });

        const dataset = [
            // nation
            {
                test: 'l\'utilisateur est de niveau national, retourne true',
                user: location.nation(),
                requested: location.nation(),
                expected: true,
                feature: 'update',
            },
            // region
            {
                test: 'l\'utilisateur est de niveau régional et demande une permission sur une ville de la région, retourne true',
                user: location.region(),
                requested: location.city(),
                expected: true,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau régional et demande une permission sur une ville d\'une autre région, retourne false',
                user: location.region(),
                requested: location.city({ region: { code: '99' } }),
                expected: false,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau régional et demande une permission au niveau national, retourne false',
                user: location.region(),
                requested: location.nation(),
                expected: false,
                feature: 'update',
            },
            // departement
            {
                test: 'l\'utilisateur est de niveau départemental et demande une permission sur une ville du département, retourne true',
                user: location.departement(),
                requested: location.city(),
                expected: true,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau départemental et demande une permission sur une ville d\'un autre département, retourne false',
                user: location.departement(),
                requested: location.city({ departement: { code: '99' } }),
                expected: false,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau départemental et demande une permission au niveau régional, retourne false',
                user: location.departement(),
                requested: location.region(),
                expected: false,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau départemental et demande une permission au niveau national, retourne false',
                user: location.departement(),
                requested: location.nation(),
                expected: false,
                feature: 'update',
            },
            // epci
            {
                test: 'l\'utilisateur est de niveau epci et demande une permission sur une ville du département associé, retourne true',
                user: location.epci(),
                requested: location.city(),
                expected: true,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau epci et demande une permission de lecture au niveau départemental, retourne true',
                user: location.epci(),
                requested: location.departement(),
                expected: true,
                feature: 'list',
            },
            {
                test: 'l\'utilisateur est de niveau epci et demande une permission d\'écriture au niveau départemental, retourne false',
                user: location.epci(),
                requested: location.departement(),
                expected: false,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau epci et demande une permission sur une ville d\'un autre epci, retourne false',
                user: location.epci(),
                requested: location.city({ epci: { code: '99' } }),
                expected: false,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau epci et demande une permission au niveau régional, retourne false',
                user: location.epci(),
                requested: location.region(),
                expected: false,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau epci et demande une permission au niveau national, retourne false',
                user: location.epci(),
                requested: location.nation(),
                expected: false,
                feature: 'update',
            },
            // city
            {
                test: 'l\'utilisateur est de niveau communal et demande une permission sur un arrondissement de sa ville, retourne true',
                user: location.city(),
                requested: location.district(),
                expected: true,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau communal et demande une permission sur sa ville, retourne true',
                user: location.city(),
                requested: location.city(),
                expected: true,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau communal et demande une permission de lecture au niveau départemental, retourne true',
                user: location.city(),
                requested: location.departement(),
                expected: true,
                feature: 'list',
            },
            {
                test: 'l\'utilisateur est de niveau communal et demande une permission d\'écriture au niveau départemental, retourne false',
                user: location.city(),
                requested: location.departement(),
                expected: false,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau communal et demande une permission sur une autre ville, retourne false',
                user: location.city(),
                requested: location.city({ city: { code: '99' } }),
                expected: false,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau communal et demande une permission au niveau régional, retourne false',
                user: location.city(),
                requested: location.region(),
                expected: false,
                feature: 'update',
            },
            {
                test: 'l\'utilisateur est de niveau communal et demande une permission au niveau national, retourne false',
                user: location.city(),
                requested: location.nation(),
                expected: false,
                feature: 'update',
            },
        ];

        dataset.forEach(({
            test, user: userLocation, requested: requestedLocation, expected, feature,
        }) => {
            it(`Si la permission est autorisée au niveau local et que ${test}`, () => {
                expect(
                    can(createUser({
                        permissions: {
                            shantytown: {
                                list: { geographic_level: 'local', write: false },
                                update: { geographic_level: 'local', write: true },
                            },
                        },
                        organization: {
                            location: userLocation,
                        },
                    })).do(feature, 'shantytown').on(requestedLocation),
                ).to.be.eql(expected);
            });
        });

        it('Si la permission est de niveau `own` mais que le dispositif est null, lance une exception', () => {
            expect(
                () => can(createUser({
                    permissions: { plan: { list: { geographic_level: 'own', write: false } } },
                })).do('list', 'plan').on(location.nation(), null),
            ).to.throw('Le dispositif est obligatoire pour une permission de type `own`');
        });

        it('Si la permission est de niveau `own` pour la feature `update` et que le dispositif n\'a pas de pilote, retourne false', () => {
            expect(
                can(createUser({
                    permissions: { plan: { update: { geographic_level: 'own', write: true } } },
                })).do('update', 'plan').on(location.nation(), {}),
            ).to.be.false;
        });

        it('Si la permission est de niveau `own` pour la feature `update` et que l\'utilisateur est le pilote du dispositif, retourne true', () => {
            expect(
                can(createUser({
                    permissions: { plan: { update: { geographic_level: 'own', write: true } } },
                })).do('update', 'plan').on(location.nation(), createPlan()),
            ).to.be.true;
        });

        it('Si la permission est de niveau `own` pour la feature `update` et que l\'utilisateur n\'est pas le pilote du dispositif, retourne false', () => {
            expect(
                can(createUser({
                    id: 3,
                    permissions: { plan: { update: { geographic_level: 'own', write: true } } },
                })).do('update', 'plan').on(location.nation(), createPlan()),
            ).to.be.false;
        });

        it('Si la permission est de niveau `own` pour la feature `updateMarks` et que le dispositif n\'a pas d\'opérateur, retourne false', () => {
            expect(
                can(createUser({
                    permissions: { plan: { updateMarks: { geographic_level: 'own', write: true } } },
                })).do('updateMarks', 'plan').on(location.nation(), {}),
            ).to.be.false;
        });

        it('Si la permission est de niveau `own` pour la feature `updateMarks` et que l\'utilisateur est un opérateur du dispositif, retourne true', () => {
            expect(
                can(createUser({
                    permissions: { plan: { updateMarks: { geographic_level: 'own', write: true } } },
                })).do('updateMarks', 'plan').on(location.nation(), createPlan()),
            ).to.be.true;
        });

        it('Si la permission est de niveau `own` pour la feature `updateMarks` et que l\'utilisateur n\'est pas un opérateur du dispositif, retourne false', () => {
            expect(
                can(createUser({
                    organization: {
                        id: 3,
                    },
                    permissions: { plan: { updateMarks: { geographic_level: 'own', write: true } } },
                })).do('updateMarks', 'plan').on(location.nation(), createPlan()),
            ).to.be.false;
        });

        it('Si la permission est de niveau `own`, que la feature demandée n\'est ni `update` ni `updateMarks`, et que l\'utilisateur est pilote du dispositif, retourne true', () => {
            const user = createUser({
                id: 666,
                organization: {
                    id: 666,
                },
                permissions: { plan: { list: { geographic_level: 'own', write: false } } },
            });

            expect(
                can(user).do('list', 'plan').on(location.nation(), createPlan({
                    government_contacts: [user],
                })),
            ).to.be.true;
        });

        it('Si la permission est de niveau `own`, que la feature demandée n\'est ni `update` ni `updateMarks`, et que l\'utilisateur est opérateur du dispositif, retourne true', () => {
            const user = createUser({
                id: 666,
                organization: {
                    id: 666,
                },
                permissions: { plan: { list: { geographic_level: 'own', write: false } } },
            });

            expect(
                can(user).do('list', 'plan').on(location.nation(), createPlan({
                    operator_contacts: [user],
                })),
            ).to.be.true;
        });

        it('Si la permission est de niveau `own`, que la feature demandée n\'est ni `update` ni `updateMarks`, et que le dispositif n\'a ni pilote ni dispositif, retourne false', () => {
            const user = createUser({
                id: 666,
                organization: {
                    id: 666,
                },
                permissions: { plan: { list: { geographic_level: 'own', write: false } } },
            });

            expect(
                can(user).do('list', 'plan').on(location.nation(), {}),
            ).to.be.false;
        });
    });
});
