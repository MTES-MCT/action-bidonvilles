const { can, where } = require('#server/services/permissionService');

const locationTypes = {
    shantytowns: 'sur site(s) : bidonville ou squat',
    location: 'sur terrain d\'insertion',
    housing: 'dans le logement',
    other: 'dans plusieurs lieux (hébergement, permanence, rue...)',
};

/**
 * Serializes a single plan row
 *
 * @param {Object} plan
 *
 * @returns {Object}
 */
function serializePlan(user, permissions, plan) {
    const location = {
        type: 'departement',
        region: {
            code: plan.region_code,
            name: plan.region_name,
        },
        departement: {
            code: plan.departement_code,
            name: plan.departement_name,
        },
        epci: null,
        city: null,
    };

    const base = {
        id: plan.id,
        name: plan.name,
        started_at: new Date(plan.startedAt).getTime(),
        expected_to_end_at: plan.expectedToEndAt ? (new Date(plan.expectedToEndAt).getTime()) : null,
        closed_at: plan.closedAt ? new Date(plan.closedAt).getTime() : null,
        updated_at: plan.updatedAt ? new Date(plan.updatedAt).getTime() : null,
        in_and_out: plan.inAndOut === true,
        goals: plan.goals,
        location_type: {
            id: plan.locationType,
            label: locationTypes[plan.locationType],
        },
        location_details: plan.locationDetails,
        final_comment: plan.finalComment,
        government_contacts: plan.managers,
        departement: {
            code: plan.departement_code,
            name: plan.departement_name,
        },
        region: {
            code: plan.region_code,
            name: plan.region_name,
        },
        operator_contacts: plan.operators,
        states: plan.states || [],
        topics: plan.topics,
        createdBy: plan.createdBy,
        updatedBy: plan.updatedBy,
    };
    base.canUpdate = can(user).do('update', 'plan').on(location, base);
    base.canUpdateMarks = can(user).do('updateMarks', 'plan').on(location, base);
    base.canClose = plan.states && plan.states.length > 0 && can(user).do('close', 'plan').on(location, base);

    if (!plan.finances || permissions.finances === null || permissions.finances.allowed !== true) {
        base.finances = [];
    } else {
        const minYear = plan.finances.slice(-1)[0].year;
        const currentYear = (new Date()).getFullYear();

        const finances = [];
        for (let y = currentYear; y >= minYear; y -= 1) {
            const finance = plan.finances.find(({ year }) => year === y);
            finances.push({
                year: y,
                data: finance ? finance.data : [],
            });
        }

        base.finances = finances;
    }

    base.audience = base.states.reduce((acc, { audience }) => {
        // in
        acc.total += audience.in.total;
        acc.families += audience.in.families;
        acc.women += audience.in.women;
        acc.minors += audience.in.minors;

        // out
        ['out_positive', 'out_abandoned', 'out_excluded'].forEach((key) => {
            if (audience[key]) {
                acc.total -= audience[key].total;
                acc.families -= audience[key].families;
                acc.women -= audience[key].women;
                acc.minors -= audience[key].minors;
            }
        });

        return acc;
    }, {
        total: 0,
        families: 0,
        women: 0,
        minors: 0,
    });

    base.last_update = null;
    if (base.states.length > 0) {
        const lastState = base.states.slice(-1)[0];
        base.last_update = new Date(lastState.date).getTime();
    }

    switch (plan.locationType) {
        case 'location':
            base.location = {
                label: plan.location_address_simple,
                address: plan.location_address,
                latitude: plan.location_latitude,
                longitude: plan.location_longitude,
            };
            break;

        case 'shantytowns':
            base.shantytowns = plan.shantytowns;
            break;

        default:
    }

    return base;
}

module.exports = (database) => {
    // eslint-disable-next-line global-require
    const userModel = require('./userModel')(database);
    // eslint-disable-next-line global-require
    const shantytownModel = require('./shantytownModel')(database);
    async function query(user, feature, filters = {}) {
        const whereStatement = [];
        const replacements = Object.assign({}, filters);

        let permissionFilter;
        try {
            permissionFilter = where().can(user).do(feature, 'plan');

            if (permissionFilter !== null) {
                whereStatement.push(permissionFilter.statement);
                Object.assign(replacements, permissionFilter.replacements);
            }
        } catch (error) {
            // une erreur doit signifier que l'utilisateur n'a pas les permissions nécessaires, donc on retourne un tableau vide
            return [];
        }

        // integrate custom filters
        const filterParts = [];
        Object.keys(filters).forEach((column) => {
            filterParts.push(`plans.${column} IN (:${column})`);
        });

        if (filterParts.length > 0) {
            whereStatement.push(filterParts.join(' OR '));
        }

        const rows = await database.query(
            `SELECT
                plans.*,
                departements.code AS "departement_code",
                departements.name AS "departement_name",
                regions.code AS "region_code",
                regions.name AS "region_name",
                locations.address AS "location_address",
                (SELECT regexp_matches(locations.address, '^(.+) [0-9]+ [^,]+,? [0-9]+,? [^, ]+(,.+)?$'))[1] AS "location_address_simple",
                locations.latitude AS "location_latitude",
                locations.longitude AS "location_longitude",
                plan_categories.uid AS "planCategoryUid",
                plan_categories.name AS "planCategoryName"
            FROM (
                SELECT
                    plans2.plan_id AS id,
                    plans2.name AS "name",
                    plans2.started_at AS "startedAt",
                    plans2.expected_to_end_at AS "expectedToEndAt",
                    plans2.closed_at AS "closedAt",
                    plans2.updated_at AS "updatedAt",
                    plans2.in_and_out AS "inAndOut",
                    plans2.goals AS "goals",
                    plans2.location_type AS "locationType",
                    plans2.location_details AS "locationDetails",
                    plans2.final_comment AS "finalComment",
                    plans2.created_by AS "createdBy",
                    plans2.updated_by AS "updatedBy",
                    plans2.fk_category,
                    plans2.fk_location,
                    ARRAY(SELECT fk_user FROM plan_managers WHERE fk_plan = plans2.plan_id) AS plan_managers,
                    ARRAY(SELECT fk_user FROM plan_operators WHERE fk_plan = plans2.plan_id) AS plan_operators
                FROM plans2
            ) AS plans
            LEFT JOIN plan_categories ON plans.fk_category = plan_categories.uid
            LEFT JOIN plan_departements ON plan_departements.fk_plan = plans.id
            LEFT JOIN departements ON plan_departements.fk_departement = departements.code
            LEFT JOIN regions ON departements.fk_region = regions.code
            LEFT JOIN locations ON plans.fk_location = locations.location_id
            ${whereStatement.length > 0 ? `WHERE (${whereStatement.join(') AND (')})` : ''}
            ORDER BY plans.id ASC`,
            {
                type: database.QueryTypes.SELECT,
                replacements,
            },
        );

        if (rows.length === 0) {
            return [];
        }

        const hashedPlans = rows.reduce((acc, plan) => Object.assign(acc, {
            [plan.id]: plan,
        }), {});

        const planIds = rows.map(({ id }) => id);
        const [planManagers, planOperators, planTopics, planStates, planShantytowns, planFinances] = await Promise.all([
            database.query(
                `SELECT
                    fk_plan,
                    fk_user
                FROM plan_managers
                WHERE fk_plan IN (:planIds)
                ORDER BY fk_plan ASC`,
                {
                    type: database.QueryTypes.SELECT,
                    replacements: Object.assign({}, replacements, {
                        planIds,
                    }),
                },
            ),
            database.query(
                'SELECT fk_plan, fk_user FROM plan_operators WHERE fk_plan IN (:planIds) ORDER BY fk_plan ASC',
                {
                    type: database.QueryTypes.SELECT,
                    replacements: {
                        planIds,
                    },
                },
            ),
            database.query(
                `SELECT
                    plan_topics.fk_plan,
                    topics.uid AS topic_uid,
                    topics.name AS topic_name
                FROM plan_topics
                LEFT JOIN topics ON plan_topics.fk_topic = topics.uid
                WHERE plan_topics.fk_plan IN (:planIds) ORDER BY plan_topics.fk_plan ASC`,
                {
                    type: database.QueryTypes.SELECT,
                    replacements: {
                        planIds,
                    },
                },
            ),
            database.query(
                `SELECT
                    plan_states.plan_state_id,
                    plan_states.date,
                    plan_states.fk_plan,
                    audience_in.total AS in_total,
                    audience_in.families AS in_families,
                    audience_in.women AS in_women,
                    audience_in.minors AS in_minors,
                    audience_out_positive.total AS out_positive_total,
                    audience_out_positive.families AS out_positive_families,
                    audience_out_positive.women AS out_positive_women,
                    audience_out_positive.minors AS out_positive_minors,
                    audience_out_abandoned.total AS out_abandoned_total,
                    audience_out_abandoned.families AS out_abandoned_families,
                    audience_out_abandoned.women AS out_abandoned_women,
                    audience_out_abandoned.minors AS out_abandoned_minors,
                    audience_out_excluded.total AS out_excluded_total,
                    audience_out_excluded.families AS out_excluded_families,
                    audience_out_excluded.women AS out_excluded_women,
                    audience_out_excluded.minors AS out_excluded_minors,
                    indicateurs_droit_commun.domiciliation,
                    indicateurs_droit_commun.droits_caf,
                    indicateurs_droit_commun.emploi_stable,
                    indicateurs_sante.ame_valide,
                    indicateurs_sante.puma_valide,
                    indicateurs_sante.ame_en_cours,
                    indicateurs_sante.puma_en_cours,
                    indicateurs_sante.orientation,
                    indicateurs_sante.accompagnement,
                    indicateurs_logement.siao,
                    indicateurs_logement.siao_people,
                    indicateurs_logement.logement_social,
                    indicateurs_logement.logement_social_people,
                    indicateurs_logement.dalo,
                    indicateurs_logement.dalo_people,
                    indicateurs_logement.accompagnes,
                    indicateurs_logement.accompagnes_people,
                    indicateurs_logement.non_accompagnes,
                    indicateurs_logement.non_accompagnes_people,
                    indicateurs_logement.heberges,
                    indicateurs_logement.heberges_people,
                    indicateurs_formation.pole_emploi,
                    indicateurs_formation.pole_emploi_femmes,
                    indicateurs_formation.mission_locale,
                    indicateurs_formation.mission_locale_femmes,
                    indicateurs_formation.contrats,
                    indicateurs_formation.contrats_femmes,
                    indicateurs_formation.formations,
                    indicateurs_formation.formations_femmes,
                    indicateurs_formation.autoentrepreneurs,
                    indicateurs_formation.autoentrepreneurs_femmes,
                    indicateurs_formation.are,
                    indicateurs_formation.are_femmes,
                    indicateurs_education.scolarisables,
                    indicateurs_education.en_mediation,
                    indicateurs_education.maternelles,
                    indicateurs_education.elementaires,
                    indicateurs_education.colleges,
                    indicateurs_education.lycees,
                    indicateurs_education.difficulte_cantine,
                    indicateurs_education.difficculte_place_up2a,
                    indicateurs_education.difficulte_transport,
                    indicateurs_securisation.points_eau,
                    indicateurs_securisation.wc,
                    indicateurs_securisation.nombre_bennes,
                    indicateurs_securisation.electricite
                FROM plan_states
                LEFT JOIN audiences audience_in ON plan_states.fk_audience_in = audience_in.audience_id
                LEFT JOIN audiences audience_out_positive ON plan_states.fk_audience_out_positive = audience_out_positive.audience_id
                LEFT JOIN audiences audience_out_abandoned ON plan_states.fk_audience_out_abandoned = audience_out_abandoned.audience_id
                LEFT JOIN audiences audience_out_excluded ON plan_states.fk_audience_out_excluded = audience_out_excluded.audience_id
                LEFT JOIN indicateurs_droit_commun ON plan_states.fk_indicateurs_commun = indicateurs_droit_commun.indicateurs_droit_commun_id
                LEFT JOIN indicateurs_sante ON plan_states.fk_indicateurs_sante = indicateurs_sante.indicateurs_sante_id
                LEFT JOIN indicateurs_logement ON plan_states.fk_indicateurs_logement = indicateurs_logement.indicateurs_logement_id
                LEFT JOIN indicateurs_formation ON plan_states.fk_indicateurs_formation = indicateurs_formation.indicateurs_formation_id
                LEFT JOIN indicateurs_education ON plan_states.fk_indicateurs_education = indicateurs_education.indicateurs_education_id
                LEFT JOIN indicateurs_securisation ON plan_states.fk_indicateurs_securisation = indicateurs_securisation.indicateurs_securisation_id
                WHERE fk_plan IN (:planIds)
                ORDER BY fk_plan, date ASC`,
                {
                    type: database.QueryTypes.SELECT,
                    replacements: {
                        planIds,
                    },
                },
            ),
            database.query(
                'SELECT fk_plan, fk_shantytown FROM plan_shantytowns WHERE fk_plan IN (:planIds) ORDER BY fk_plan ASC',
                {
                    type: database.QueryTypes.SELECT,
                    replacements: {
                        planIds,
                    },
                },
            ),
            database.query(
                `SELECT
                    finances.fk_plan,
                    finances.finance_id,
                    finances.year,
                    finances.closed,
                    finance_rows.amount,
                    finance_rows.real_amount,
                    finance_rows.comments,
                    finance_types.uid AS finance_type_uid,
                    finance_types.name AS finance_type_name
                FROM
                    finances
                LEFT JOIN finance_rows ON finance_rows.fk_finance = finances.finance_id
                LEFT JOIN finance_types ON finance_rows.fk_finance_type = finance_types.uid
                WHERE finances.fk_plan IN (:planIds)
                ORDER BY fk_plan ASC, finances.year DESC`,
                {
                    type: database.QueryTypes.SELECT,
                    replacements: {
                        planIds,
                    },
                },
            ),
        ]);

        // users
        const serializedUsers = await userModel.findByIds(
            null,
            [...planManagers, ...planOperators].map(({ fk_user: id }) => id),
        );
        const hashedUsers = serializedUsers.reduce((acc, u) => Object.assign(acc, {
            [u.id]: u,
        }), {});

        planManagers.forEach(({ fk_plan: planId, fk_user: userId }) => {
            if (hashedPlans[planId].managers === undefined) {
                hashedPlans[planId].managers = [];
            }

            hashedPlans[planId].managers.push(hashedUsers[userId]);
        });
        planOperators.forEach(({ fk_plan: planId, fk_user: userId }) => {
            if (hashedPlans[planId].operators === undefined) {
                hashedPlans[planId].operators = [];
            }

            hashedPlans[planId].operators.push(hashedUsers[userId]);
        });

        // topics
        planTopics.forEach(({ fk_plan: planId, topic_uid: uid, topic_name: name }) => {
            if (hashedPlans[planId].topics === undefined) {
                hashedPlans[planId].topics = [];
            }

            hashedPlans[planId].topics.push({
                uid,
                name,
            });
        });

        // plan states
        const planStateIds = planStates.map(({ plan_state_id: id }) => id);
        let serializedEtp = {};
        if (planStateIds.length > 0) {
            const etp = await database.query(
                `SELECT
                    plan_state_etp.fk_plan_state,
                    plan_state_etp.total,
                    etp_types.uid AS etp_type_uid,
                    etp_types.name AS etp_type_name
                FROM plan_state_etp
                LEFT JOIN etp_types ON plan_state_etp.fk_etp_type = etp_types.uid
                WHERE plan_state_etp.fk_plan_state IN (:planStateIds)`,
                {
                    type: database.QueryTypes.SELECT,
                    replacements: {
                        planStateIds,
                    },
                },
            );

            serializedEtp = etp.reduce((acc, {
                fk_plan_state, total, etp_type_uid, etp_type_name,
            }) => {
                if (!acc[fk_plan_state]) {
                    acc[fk_plan_state] = [];
                }

                acc[fk_plan_state].push({
                    type: {
                        uid: etp_type_uid,
                        name: etp_type_name,
                    },
                    total,
                });
                return acc;
            }, {});
        }

        const parsedPlanStates = planStates.reduce((acc, state) => {
            if (acc[state.fk_plan] === undefined) {
                acc[state.fk_plan] = [];
            }

            acc[state.fk_plan].push({
                id: state.plan_state_id,
                date: new Date(state.date).getTime(),
                etp: serializedEtp[state.plan_state_id] || [],
                audience: {
                    in: {
                        total: state.in_total,
                        families: state.in_families,
                        women: state.in_women,
                        minors: state.in_minors,
                    },
                    out_positive: state.out_positive_total !== null ? {
                        total: state.out_positive_total,
                        families: state.out_positive_families,
                        women: state.out_positive_women,
                        minors: state.out_positive_minors,
                    } : null,
                    out_abandoned: state.out_abandoned_total !== null ? {
                        total: state.out_abandoned_total,
                        families: state.out_abandoned_families,
                        women: state.out_abandoned_women,
                        minors: state.out_abandoned_minors,
                    } : null,
                    out_excluded: state.out_excluded_total !== null ? {
                        total: state.out_excluded_total,
                        families: state.out_excluded_families,
                        women: state.out_excluded_women,
                        minors: state.out_excluded_minors,
                    } : null,
                },
                droit_commun: {
                    domiciliation: state.domiciliation,
                    droits_caf: state.droits_caf,
                    emploi_stable: state.emploi_stable,
                },
                sante: hashedPlans[state.fk_plan].topics.find(({ uid }) => uid === 'health') ? {
                    ame_valide: state.ame_valide,
                    puma_valide: state.puma_valide,
                    ame_en_cours: state.ame_en_cours,
                    puma_en_cours: state.puma_en_cours,
                    orientation: state.orientation,
                    accompagnement: state.accompagnement,
                } : null,
                logement: hashedPlans[state.fk_plan].topics.find(({ uid }) => uid === 'housing') ? {
                    siao: {
                        people: state.siao_people,
                        families: state.siao,
                    },
                    logement_social: {
                        people: state.logement_social_people,
                        families: state.logement_social,
                    },
                    dalo: {
                        people: state.dalo_people,
                        families: state.dalo,
                    },
                    accompagnes: {
                        people: state.accompagnes_people,
                        families: state.accompagnes,
                    },
                    non_accompagnes: {
                        people: state.non_accompagnes_people,
                        families: state.non_accompagnes,
                    },
                    heberges: {
                        people: state.heberges_people,
                        families: state.heberges,
                    },
                } : null,
                formation: hashedPlans[state.fk_plan].topics.find(({ uid }) => uid === 'work') ? {
                    pole_emploi: state.pole_emploi,
                    pole_emploi_femmes: state.pole_emploi_femmes,
                    mission_locale: state.mission_locale,
                    mission_locale_femmes: state.mission_locale_femmes,
                    contrats: state.contrats,
                    contrats_femmes: state.contrats_femmes,
                    formations: state.formations,
                    formations_femmes: state.formations_femmes,
                    autoentrepreneurs: state.autoentrepreneurs,
                    autoentrepreneurs_femmes: state.autoentrepreneurs_femmes,
                    are: state.are,
                    are_femmes: state.are_femmes,
                } : null,
                education: hashedPlans[state.fk_plan].topics.find(({ uid }) => uid === 'school') ? {
                    scolarisables: state.scolarisables,
                    en_mediation: state.en_mediation,
                    maternelles: state.maternelles,
                    elementaires: state.elementaires,
                    colleges: state.colleges,
                    lycees: state.lycees,
                    difficulte_cantine: state.difficulte_cantine,
                    difficculte_place_up2a: state.difficculte_place_up2a,
                    difficulte_transport: state.difficulte_transport,
                } : null,
                securisation: hashedPlans[state.fk_plan].topics.find(({ uid }) => uid === 'safety') ? {
                    points_eau: state.points_eau,
                    wc: state.wc,
                    nombre_bennes: state.nombre_bennes,
                    electricite: state.electricite,
                } : null,
            });

            return acc;
        }, {});
        Object.keys(parsedPlanStates).forEach((planId) => {
            hashedPlans[planId].states = parsedPlanStates[planId];
        });

        // shantytowns
        let hashedShantytowns = {};

        if (planShantytowns.length > 0) {
            const serializedShantytowns = await shantytownModel.findAll(
                user,
                [{ shantytown_id: planShantytowns.map(({ fk_shantytown: id }) => id) }],
            );
            hashedShantytowns = serializedShantytowns.reduce((acc, shantytown) => Object.assign(acc, {
                [shantytown.id]: shantytown,
            }), {});
        }

        planShantytowns
            .filter(({ fk_shantytown: shantytownId }) => hashedShantytowns[shantytownId] !== undefined)
            .forEach(({ fk_plan: planId, fk_shantytown: shantytownId }) => {
                if (hashedPlans[planId].shantytowns === undefined) {
                    hashedPlans[planId].shantytowns = [];
                }

                hashedPlans[planId].shantytowns.push(hashedShantytowns[shantytownId]);
            });

        // finances
        planFinances.forEach((finance) => {
            if (hashedPlans[finance.fk_plan].finances === undefined) {
                hashedPlans[finance.fk_plan].finances = [];
            }

            let yearGroup = hashedPlans[finance.fk_plan].finances.find(({ year }) => year === finance.year);
            if (yearGroup === undefined) {
                yearGroup = {
                    year: finance.year,
                    data: [],
                };
                hashedPlans[finance.fk_plan].finances.push(yearGroup);
            }

            yearGroup.data.push({
                type: {
                    uid: finance.finance_type_uid,
                    name: finance.finance_type_name,
                },
                amount: finance.amount,
                realAmount: finance.real_amount,
                details: finance.comments,
            });
        });

        return rows
            .map(serializePlan.bind(this, user, {
                plan: user.permissions.plan[feature],
                finances: (user.permissions.plan_finances && user.permissions.plan_finances.access) || null,
            }));
    }

    return {
        findAll: user => query(user, 'list'),

        findOne: async (user, id) => {
            const rows = await query(user, 'read', {
                id,
            });

            if (rows.length === 1) {
                return rows[0];
            }

            return null;
        },

        delete: planId => database.query(
            'DELETE FROM plans2 WHERE plan_id = :planId',
            {
                replacements: {
                    planId,
                },
            },
        ),
    };
};
