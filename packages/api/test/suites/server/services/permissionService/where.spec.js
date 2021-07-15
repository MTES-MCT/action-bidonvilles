const { expect } = require('chai');
const { where } = require('#server/services/permissionService');
const { serialized: createUser } = require('#test/utils/user');
const location = require('#test/utils/location');

describe.only('PermissionService', () => {
    describe('.where().can(user).do(feature, entity)', () => {
        it('Si l\'utilisateur n\'est pas défini, lance une exception', () => {
            expect(
                () => where().can(undefined).do('list', 'shantytown'),
            ).to.throw('L\'utilisateur ne dispose pas de la permission shantytown.list');
        });

        it('Si l\'utilisateur est défini mais ne dispose pas de permissions, lance une exception', () => {
            expect(
                () => where().can(createUser({ permissions: undefined })).do('list', 'shantytown'),
            ).to.throw('L\'utilisateur ne dispose pas de la permission shantytown.list');
        });

        it('Si l\'utilisateur est défini mais ne dispose pas de permissions pour l\'entitée demandée, lance une exception', () => {
            expect(
                () => where().can(createUser()).do('list', 'whatever'),
            ).to.throw('L\'utilisateur ne dispose pas de la permission whatever.list');
        });

        it('Si l\'utilisateur est défini mais ne dispose pas de la permission demandée, lance une exception', () => {
            expect(
                () => where().can(createUser()).do('whatever', 'shantytown'),
            ).to.throw('L\'utilisateur ne dispose pas de la permission shantytown.whatever');
        });

        it('Si l\'utilisateur est défini mais la permission demandée est set à allowed=false, lance une exception', () => {
            expect(
                () => where().can(createUser({
                    permissions: { shantytown: { list: { allowed: false, write: false } } },
                })).do('list', 'shantytown'),
            ).to.throw('L\'utilisateur ne dispose pas de la permission shantytown.list');
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau national, retourne null', () => {
            expect(
                where().can(createUser()).do('list', 'shantytown'),
            ).to.be.eql(null);
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau régional et qu\'il est de niveau communal, retourne sa région', () => {
            expect(
                where().can(createUser({
                    permissions: { shantytown: { list: { allowed: true, geographic_level: 'region', write: false } } },
                    organization: { location: location.city() },
                })).do('list', 'shantytown'),
            ).to.be.eql({ statement: 'regions.code IN (:where_region)', replacements: { where_region: ['11'] } });
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau régional et qu\'il est de niveau national, lance une exception', () => {
            expect(
                () => where().can(createUser({
                    permissions: { shantytown: { list: { allowed: true, geographic_level: 'region', write: false } } },
                })).do('list', 'shantytown'),
            ).to.throw('Impossible d\'accorder une permission régionale à un utilisateur national');
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau départemental et qu\'il est de niveau communal, retourne son département', () => {
            expect(
                where().can(createUser({
                    permissions: { shantytown: { list: { allowed: true, geographic_level: 'departement', write: false } } },
                    organization: { location: location.city() },
                })).do('list', 'shantytown'),
            ).to.be.eql({ statement: 'departements.code IN (:where_departement)', replacements: { where_departement: ['92'] } });
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau départemental et qu\'il est de niveau régional, lance une exception', () => {
            expect(
                () => where().can(createUser({
                    permissions: { shantytown: { list: { allowed: true, geographic_level: 'departement', write: false } } },
                    organization: { location: location.region() },
                })).do('list', 'shantytown'),
            ).to.throw('Impossible d\'accorder une permission départementale à un utilisateur non rattaché à un département');
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau intercommunal et qu\'il est de niveau intercommunal, retourne son epci', () => {
            expect(
                where().can(createUser({
                    permissions: { shantytown: { list: { allowed: true, geographic_level: 'epci', write: false } } },
                    organization: { location: location.city() },
                })).do('list', 'shantytown'),
            ).to.be.eql({ statement: 'epci.code IN (:where_epci)', replacements: { where_epci: ['200054781'] } });
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau intercommunal et qu\'il est de niveau départemental, lance une exception', () => {
            expect(
                () => where().can(createUser({
                    permissions: { shantytown: { list: { allowed: true, geographic_level: 'epci', write: false } } },
                    organization: { location: location.departement() },
                })).do('list', 'shantytown'),
            ).to.throw('Impossible d\'accorder une permission intercommunale à un utilisateur non rattaché à une epci');
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau communal et qu\'il est de niveau communal, retourne sa commune', () => {
            expect(
                where().can(createUser({
                    permissions: { shantytown: { list: { allowed: true, geographic_level: 'city', write: false } } },
                    organization: { location: location.city() },
                })).do('list', 'shantytown'),
            ).to.be.eql({ statement: 'cities.code IN (:where_city) OR cities.fk_main IN (:where_city)', replacements: { where_city: ['75056'] } });
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau communal et qu\'il est de niveau intercommunal, lance une exception', () => {
            expect(
                () => where().can(createUser({
                    permissions: { shantytown: { list: { allowed: true, geographic_level: 'city', write: false } } },
                    organization: { location: location.epci() },
                })).do('list', 'shantytown'),
            ).to.throw('Impossible d\'accorder une permission communale à un utilisateur non rattaché à une commune');
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau local et qu\'il est de niveau national, retourne null', () => {
            expect(
                where().can(createUser({
                    permissions: { shantytown: { list: { allowed: true, geographic_level: 'local', write: false } } },
                })).do('list', 'shantytown'),
            ).to.be.eql(null);
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau local et qu\'il est de niveau régional, retourne sa région', () => {
            expect(
                where().can(createUser({
                    permissions: { shantytown: { list: { allowed: true, geographic_level: 'local', write: false } } },
                    organization: { location: location.region() },
                })).do('list', 'shantytown'),
            ).to.be.eql({ statement: 'regions.code IN (:where_region)', replacements: { where_region: ['11'] } });
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau local, qu\'il s\'agit d\'une permission d\'écriture, et qu\'il est de niveau communal, retourne sa commune', () => {
            expect(
                where().can(createUser({
                    permissions: { shantytown: { update: { allowed: true, geographic_level: 'local', write: true } } },
                    organization: { location: location.city() },
                })).do('update', 'shantytown'),
            ).to.be.eql({ statement: 'cities.code IN (:where_city) OR cities.fk_main IN (:where_city)', replacements: { where_city: ['75056'] } });
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau local, qu\'il s\'agit d\'une permission de lecture, et qu\'il est de niveau communal, retourne son département', () => {
            expect(
                where().can(createUser({
                    permissions: { shantytown: { list: { allowed: true, geographic_level: 'local', write: false } } },
                    organization: { location: location.city() },
                })).do('list', 'shantytown'),
            ).to.be.eql({ statement: 'departements.code IN (:where_departement)', replacements: { where_departement: ['92'] } });
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau own, et que l\'entité n\'est pas plan, lance une exception', () => {
            expect(
                () => where().can(createUser({
                    permissions: { shantytown: { update: { allowed: true, geographic_level: 'own', write: true } } },
                })).do('update', 'shantytown'),
            ).to.throw('Impossible d\'accorder une permission de niveau `own` à l\'entité `shantytown`');
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau own, retourne un filtre sur les managers et operators', () => {
            expect(
                where().can(createUser({
                    permissions: { plan: { list: { allowed: true, geographic_level: 'own', write: false } } },
                })).do('list', 'plan'),
            ).to.be.eql({ statement: '(plan_managers && ARRAY[:where_managers]) OR (plan_operators && ARRAY[:where_managers])', replacements: { where_managers: [2] } });
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau epci pour l\'entité plan, lance une exception', () => {
            expect(
                () => where().can(createUser({
                    permissions: { plan: { list: { allowed: true, geographic_level: 'epci', write: false } } },
                    organization: { location: location.city() },
                })).do('list', 'plan'),
            ).to.throw('Impossible d\'accorder une permission de niveau `epci` à l\'entité `plan`');
        });

        it('Si l\'utilisateur dispose de la permission demandée au niveau city pour l\'entité plan, lance une exception', () => {
            expect(
                () => where().can(createUser({
                    permissions: { plan: { list: { allowed: true, geographic_level: 'city', write: false } } },
                    organization: { location: location.city() },
                })).do('list', 'plan'),
            ).to.throw('Impossible d\'accorder une permission de niveau `city` à l\'entité `plan`');
        });

        it('Si l\'utilisateur dispose de la permission demandée à un niveau inconnu, lance une exception', () => {
            expect(
                () => where().can(createUser({
                    permissions: { shantytown: { list: { allowed: true, geographic_level: 'whatever', write: false } } },
                })).do('list', 'shantytown'),
            ).to.throw('Niveau de permission inconnu');
        });
    });
});
