const { trim } = require('validator');
const { sequelize } = require('#db/models');

function sanitize(data) {
    const sanitizedData = {};

    // name
    if (typeof data.name === 'string') {
        sanitizedData.name = trim(data.name);
    }

    // departement
    if (typeof data.departement === 'string') {
        sanitizedData.departement = trim(data.departement);
    }

    // started at
    const startedAt = new Date(data.startedAt);
    if (!Number.isNaN(startedAt.getTime())) {
        sanitizedData.startedAt = startedAt;
    }

    // expected to end at
    if (data.expectedToEndAt === undefined || data.expectedToEndAt === null) {
        sanitizedData.expectedToEndAt = null;
    } else {
        const expectedToEndAt = new Date(data.expectedToEndAt);
        if (!Number.isNaN(expectedToEndAt.getTime())) {
            sanitizedData.expectedToEndAt = expectedToEndAt;
        }
    }

    // in and out
    if (data.in_and_out === 1) {
        sanitizedData.inAndOut = true;
    } else if (data.in_and_out === 0) {
        sanitizedData.inAndOut = false;
    }

    // topics
    if (Array.isArray(data.topics)) {
        sanitizedData.topics = data.topics;
    }

    // goals
    if (typeof data.goals === 'string') {
        sanitizedData.goals = trim(data.goals);
    }

    // location
    if (typeof data.locationType === 'string') {
        sanitizedData.locationType = data.locationType;
    }

    switch (data.locationType) {
        case 'shantytowns':
            if (Array.isArray(data.locationShantytowns)) {
                sanitizedData.locationShantytowns = data.locationShantytowns;
            } else {
                sanitizedData.locationShantytowns = [];
            }
            break;

        case 'location':
            if (data.locationAddress && data.locationAddress.address && data.locationAddress.location) {
                sanitizedData.locationAddress = {
                    latitude: data.locationAddress.location.coordinates[0],
                    longitude: data.locationAddress.location.coordinates[1],
                    address: data.locationAddress.address.label,
                };
            } else {
                sanitizedData.locationAddress = null;
            }
            break;

        case 'other':
            if (typeof data.locationDetails === 'string') {
                sanitizedData.locationDetails = trim(data.locationDetails);
            }
            break;

        default:
        case 'housing':
            break;
    }

    if (!sanitizedData.locationDetails) {
        sanitizedData.locationDetails = null;
    }

    // government contact
    if (Array.isArray(data.government)) {
        if (data.government.length === 0) {
            sanitizedData.government = null;
        } else {
            [sanitizedData.government] = data.government;
        }
    }

    // association contact
    if (Array.isArray(data.association)) {
        if (data.association.length === 0) {
            sanitizedData.association = null;
        } else {
            [sanitizedData.association] = data.association;
        }
    }

    if (data.contact === undefined || data.contact === null) {
        sanitizedData.associationContact = null;
    } else {
        sanitizedData.associationContact = parseInt(data.contact, 10);
    }

    // fundings
    const currentYear = (new Date()).getFullYear();
    if (Array.isArray(data.finances)) {
        sanitizedData.finances = data.finances
            .filter(({ data: d }) => d && d.length > 0)
            .map(({ year, data: d }) => ({
                year: parseInt(year, 10),
                data: d.map(({
                    type, amount, realAmount, details,
                }) => ({
                    type: type !== null ? type : null,
                    amount: parseFloat(amount),
                    realAmount: parseInt(year, 10) < currentYear && realAmount ? parseFloat(realAmount) : null,
                    details: trim(details),
                })),
            }));
    }

    return sanitizedData;
}

function sanitizeState(plan, data) {
    const sanitizedData = {};

    // date
    const date = new Date(data.date);
    if (!Number.isNaN(date.getTime())) {
        sanitizedData.date = date;
    }

    // etp
    if (Array.isArray(data.etp)) {
        sanitizedData.etp = data.etp.map(({ total, type }) => ({
            total: parseFloat(total) || 0,
            type,
        }));
    }

    // audience
    const audience = data.audience || {
        in: {
            total: 0, families: 0, women: 0, minors: 0,
        },
        out_positive: {
            total: 0, families: 0, women: 0, minors: 0,
        },
        out_abandoned: {
            total: 0, families: 0, women: 0, minors: 0,
        },
        out_excluded: {
            total: 0, families: 0, women: 0, minors: 0,
        },
    };

    function extractAudience(key) {
        return {
            total: parseInt(audience[key].people, 10),
            families: parseInt(audience[key].households, 10),
            women: parseInt(audience[key].women, 10),
            minors: parseInt(audience[key].minors, 10),
        };
    }

    if (plan.states.length === 0) {
        sanitizedData.audience = {
            in: extractAudience('in'),
            out_positive: null,
            out_abandoned: null,
            out_excluded: null,
        };
    } else {
        sanitizedData.audience = {
            in: extractAudience('in'),
            out_positive: extractAudience('out_positive'),
            out_abandoned: extractAudience('out_abandoned'),
            out_excluded: extractAudience('out_excluded'),
        };
    }

    const topics = plan.topics.map(({ uid }) => uid);

    function getIntOrNull(value) {
        return value !== '' && value !== undefined ? parseInt(value, 10) : null;
    }

    // indicateurs droit commun
    sanitizedData.domiciliation = getIntOrNull(data.domiciliation);
    sanitizedData.droits_caf = getIntOrNull(data.droits_caf);
    sanitizedData.emploi_stable = getIntOrNull(data.emploi_stable);

    // indicateurs santé
    if (topics.indexOf('health') !== -1) {
        sanitizedData.ame_valide = getIntOrNull(data.ame_valide);
        sanitizedData.puma_valide = getIntOrNull(data.puma_valide);
        sanitizedData.ame_en_cours = getIntOrNull(data.ame_en_cours);
        sanitizedData.puma_en_cours = getIntOrNull(data.puma_en_cours);
        sanitizedData.orientation = getIntOrNull(data.orientation);
        sanitizedData.accompagnement = getIntOrNull(data.accompagnement);
    }

    // indicateurs logement
    if (topics.indexOf('housing') !== -1) {
        sanitizedData.siao = getIntOrNull(data.siao.families);
        sanitizedData.siao_people = getIntOrNull(data.siao.people);
        sanitizedData.logement_social = getIntOrNull(data.logement_social.families);
        sanitizedData.logement_social_people = getIntOrNull(data.logement_social.people);
        sanitizedData.dalo = getIntOrNull(data.dalo.families);
        sanitizedData.dalo_people = getIntOrNull(data.dalo.people);
        sanitizedData.accompagnes = getIntOrNull(data.accompagnes.families);
        sanitizedData.accompagnes_people = getIntOrNull(data.accompagnes.people);
        sanitizedData.non_accompagnes = getIntOrNull(data.non_accompagnes.families);
        sanitizedData.non_accompagnes_people = getIntOrNull(data.non_accompagnes.people);
        sanitizedData.heberges = getIntOrNull(data.heberges.families);
        sanitizedData.heberges_people = getIntOrNull(data.heberges.people);
    }

    // indicateurs sécurisation
    if (topics.indexOf('safety') !== -1) {
        sanitizedData.points_eau = getIntOrNull(data.points_eau);
        sanitizedData.wc = getIntOrNull(data.wc);
        sanitizedData.nombre_bennes = getIntOrNull(data.nombre_bennes);
        sanitizedData.electricite = getIntOrNull(data.electricite);
    }

    // indicateurs éducation
    if (topics.indexOf('school') !== -1) {
        sanitizedData.scolarisables = getIntOrNull(data.scolarisables);
        sanitizedData.en_mediation = getIntOrNull(data.en_mediation);
        sanitizedData.maternelles = getIntOrNull(data.maternelles);
        sanitizedData.elementaires = getIntOrNull(data.elementaires);
        sanitizedData.colleges = getIntOrNull(data.colleges);
        sanitizedData.lycees = getIntOrNull(data.lycees);
        sanitizedData.difficulte_cantine = data.difficultes && data.difficultes.indexOf('cantine') !== -1;
        sanitizedData.difficulte_place_up2a = data.difficultes && data.difficultes.indexOf('place_up2a') !== -1;
        sanitizedData.difficulte_transport = data.difficultes && data.difficultes.indexOf('transport') !== -1;
    }

    // indicateurs formation
    if (topics.indexOf('work') !== -1) {
        sanitizedData.pole_emploi = getIntOrNull(data.pole_emploi);
        sanitizedData.pole_emploi_femmes = getIntOrNull(data.pole_emploi_femmes);
        sanitizedData.mission_locale = getIntOrNull(data.mission_locale);
        sanitizedData.mission_locale_femmes = getIntOrNull(data.mission_locale_femmes);
        sanitizedData.contrats = getIntOrNull(data.contrats);
        sanitizedData.contrats_femmes = getIntOrNull(data.contrats_femmes);
        sanitizedData.formations = getIntOrNull(data.formations);
        sanitizedData.formations_femmes = getIntOrNull(data.formations_femmes);
        sanitizedData.autoentrepreneurs = getIntOrNull(data.autoentrepreneurs);
        sanitizedData.autoentrepreneurs_femmes = getIntOrNull(data.autoentrepreneurs_femmes);
        sanitizedData.are = getIntOrNull(data.are);
        sanitizedData.are_femmes = getIntOrNull(data.are_femmes);
    }

    return sanitizedData;
}

function sanitizeClose(data) {
    const sanitizedData = {};

    // closed at
    const closedAt = new Date(data.closedAt);
    if (!Number.isNaN(closedAt.getTime())) {
        sanitizedData.closedAt = closedAt;
    }

    // comment
    if (typeof data.comment === 'string') {
        sanitizedData.comment = trim(data.comment);
    }

    // fundings
    if (Array.isArray(data.finances)) {
        sanitizedData.finances = data.finances
            .filter(({ data: d }) => d && d.length > 0)
            .map(({ year, data: d }) => ({
                year: parseInt(year, 10),
                data: d.map(({
                    type, amount, realAmount, details,
                }) => ({
                    type: type !== null ? type : null,
                    amount: parseFloat(amount),
                    realAmount: realAmount ? parseFloat(realAmount) : null,
                    details: trim(details),
                })),
            }));
    }

    return sanitizedData;
}

async function historize(planId, transaction) {
    // save current state into history
    const response = await sequelize.query(
        `INSERT INTO plans_history(
            plan_id,
            name,
            started_at,
            closed_at,
            expected_to_end_at,
            in_and_out,
            goals,
            fk_category,
            location_type,
            location_details,
            fk_location,
            final_comment,
            created_by,
            created_at,
            updated_by,
            updated_at
        ) (SELECT
            plan_id,
            name,
            started_at,
            closed_at,
            expected_to_end_at,
            in_and_out,
            goals,
            fk_category,
            location_type,
            location_details,
            fk_location,
            final_comment,
            created_by,
            created_at,
            updated_by,
            updated_at
        FROM plans2
        WHERE plan_id = :planId)
        RETURNING hid AS id`,
        {
            replacements: {
                planId,
            },
            transaction,
        },
    );
    const hid = response[0][0].id;

    await sequelize.query(
        `INSERT INTO plan_managers_history(
            fk_plan,
            fk_user,
            created_by,
            created_at,
            updated_by,
            updated_at
        ) (SELECT
            :hid,
            fk_user,
            created_by,
            created_at,
            updated_by,
            updated_at
        FROM plan_managers
        WHERE fk_plan = :planId)`,
        {
            replacements: {
                hid,
                planId,
            },
            transaction,
        },
    );

    await sequelize.query(
        `INSERT INTO finances_history(
            fk_plan,
            year,
            closed,
            created_by,
            created_at,
            updated_by,
            updated_at
        ) (SELECT
            :hid,
            year,
            closed,
            created_by,
            created_at,
            updated_by,
            updated_at
        FROM finances
        WHERE fk_plan = :planId)`,
        {
            replacements: {
                hid,
                planId,
            },
            transaction,
        },
    );
    const financeHids = await sequelize.query(
        `SELECT
            finances_history.finance_id AS hid,
            finances.finance_id
        FROM finances_history
        LEFT JOIN finances ON (finances.fk_plan = :planId AND finances.year = finances_history.year)
        WHERE finances_history.fk_plan = :hid`,
        {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                hid,
                planId,
            },
            transaction,
        },
    );

    await Promise.all(
        financeHids.map(({ hid: financeHid, finance_id: financeId }) => sequelize.query(
            `INSERT INTO finance_rows_history(
                fk_finance,
                fk_finance_type,
                amount,
                real_amount,
                comments,
                created_by,
                created_at,
                updated_by,
                updated_at
            ) (SELECT
                :hid,
                fk_finance_type,
                amount,
                real_amount,
                comments,
                created_by,
                created_at,
                updated_by,
                updated_at
            FROM finance_rows
            WHERE fk_finance = :financeId)`,
            {
                replacements: {
                    hid: financeHid,
                    financeId,
                },
                transaction,
            },
        )),
    );

    return hid;
}

module.exports = models => ({
    async list(req, res) {
        try {
            const plans = await models.plan.findAll(req.user);
            res.status(200).send(plans);
        } catch (error) {
            res.status(500).send({
                error: {
                    user_message: 'Une erreur est survenue lors de la récupération des données en base',
                    developer_message: error.message,
                },
            });
        }
    },

    async find(req, res) {
        try {
            const plan = await models.plan.findOne(req.user, req.params.id);

            if (plan === null) {
                res.status(404).send({
                    error: {
                        user_message: 'Le dispositif demandé n\'existe pas',
                    },
                });
                return;
            }

            res.status(200).send(plan);
        } catch (error) {
            res.status(500).send({
                error: {
                    user_message: 'Une erreur est survenue lors de la récupération des données en base',
                    developer_message: error.message,
                },
            });
        }
    },

    async create(req, res, next) {
        // sanitize data
        const planData = Object.assign({}, sanitize(req.body), {
            createdBy: req.user.id,
        });

        // validate data
        const errors = {};
        function addError(field, error) {
            if (errors[field] === undefined) {
                errors[field] = [];
            }

            errors[field].push(error);
        }

        try {
            const departement = await models.departement.findOne(planData.departement);
            if (departement === null) {
                addError('departement', 'Le département d\'intervention est obligatoire');
            }
        } catch (error) {
            res.status(500).send({
                success: false,
                error: {
                    developer_message: 'Could not find the matching departement in database',
                    user_message: 'Une erreur de lecture en base de données est survenue',
                },
            });
            return next(error);
        }

        let financeTypes;
        try {
            financeTypes = (await models.financeType.findAll()).reduce((acc, type) => Object.assign({}, acc, {
                [type.uid]: type,
            }), {});
        } catch (error) {
            res.status(500).send({
                success: false,
                error: {
                    developer_message: 'Could not fetch the list of finance types from the database',
                    user_message: 'Une erreur de lecture en base de données est survenue',
                },
            });
            return next(error);
        }

        let topics;
        try {
            topics = (await models.topic.findAll()).reduce((acc, topic) => Object.assign({}, acc, {
                [topic.uid]: topic,
            }), {});
        } catch (error) {
            res.status(500).send({
                success: false,
                error: {
                    developer_message: 'Could not fetch the list of topics from the database',
                    user_message: 'Une erreur de lecture en base de données est survenue',
                },
            });
            return next(error);
        }

        if (!planData.name) {
            addError('name', 'Le nom du dispositif est obligatoire');
        }

        if (!planData.startedAt) {
            addError('startedAt', 'La date de début du dispositif est obligatoire');
        }

        if (planData.expectedToEndAt && planData.expectedToEndAt <= planData.startedAt) {
            addError('expectedToEndAt', 'La date de fin du dispositif ne peut pas être antérieure à la date de début');
        }

        if (typeof planData.inAndOut !== 'boolean') {
            addError('in_and_out', 'Ce champ est obligatoire');
        }

        if (planData.topics.length === 0) {
            addError('topics', 'Vous devez sélectionner au moins une thématique');
        } else {
            const unknownTopics = planData.topics.filter(uid => topics[uid] === undefined);
            if (unknownTopics.length > 0) {
                addError('topics', `Les thématiques suivantes n'ont pas été reconnues : ${unknownTopics.join(', ')}`);
            }
        }

        if (!planData.goals) {
            addError('goals', 'Les objectifs sont obligatoires');
        }

        if (!planData.locationType) {
            addError('locationType', 'Le lieu est obligatoire');
        } else if (['shantytowns', 'location', 'housing', 'other'].indexOf(planData.locationType) === -1) {
            addError('locationType', 'Le type de lieu sélectionné n\'est pas reconnu');
        }

        switch (planData.locationType) {
            case 'shantytowns':
                if (planData.locationShantytowns.length === 0) {
                    addError('locationShantytowns', 'Vous devez sélectionner au moins un site');
                } else {
                    try {
                        const ids = await models.shantytown.findAll(req.user, [
                            {
                                shantytown_id: planData.locationShantytowns,
                            },
                        ]);

                        if (ids.length !== planData.locationShantytowns.length) {
                            addError('locationShantytowns', 'Un ou plusieurs sites sélectionnés n\'ont pas été retrouvés en base de données');
                        }
                    } catch (error) {
                        addError('locationShantytowns', 'Une erreur est survenue lors de la validation des sites');
                    }
                }
                break;

            case 'location':
                if (!planData.locationAddress) {
                    addError('locationAddress', 'L\'adresse du terrain est obligatoire');
                }
                break;

            case 'other':
                if (!planData.locationDetails) {
                    addError('locationDetails', 'Vous devez préciser les lieux de déroulement du dispositif');
                }
                break;

            default:
        }

        if (!planData.government) {
            addError('government', 'Vous devez désigner la personne en charge du pilotage du dispositif');
        } else {
            try {
                const user = await models.user.findOne(planData.government.id);
                if (user === null) {
                    addError('government', 'La personne désignée comme pilote du dispositif n\'a pas été retrouvée en base de données');
                } else if (user.organization.category.uid !== 'public_establishment') {
                    addError('government', 'Le pilote du dispositif doit faire partie d\'un service de l\'état');
                }
            } catch (error) {
                addError('government', 'Une erreur est survenue lors de la validation du pilote du dispositif');
            }
        }

        if (!planData.associationContact) {
            addError('association', 'Vous devez désigner la personne référente au sein de l\'opérateur ou service en charge de l\'intervention');
        } else {
            try {
                const user = await models.user.findOne(planData.associationContact);
                if (user === null) {
                    addError('contact', 'La personne référente n\'a pas été retrouvée en base de données');
                } else if (user.organization.category.uid !== 'association') {
                    addError('association', 'Le service en charge de l\'intervention doit être une association');
                }
            } catch (error) {
                addError('contact', 'Une erreur est survenue lors de la validation du service en charge de l\'intervention');
            }
        }

        if (planData.finances) {
            planData.finances.forEach(({ year, data }) => {
                if (year > (new Date()).getFullYear()) {
                    addError('finances', `Il est impossible de saisir les financements pour l'année ${year}`);
                } else {
                    data.forEach(({ amount, type }, index) => {
                        const typeName = financeTypes[type] ? `'${financeTypes[type].name}'` : `de la ligne n°${index + 1}`;

                        if (!type) {
                            addError('finances', `Année ${year} : merci de préciser le type de financement pour la ligne n°${index + 1}`);
                        } else if (financeTypes[type] === undefined) {
                            addError('finances', `Année ${year} : le type de financement de la ligne n°${index + 1} n'est pas reconnu`);
                        }

                        if (Number.isNaN(amount)) {
                            addError('finances', `Année ${year} : le montant du financement ${typeName} est invalide`);
                        } else if (amount <= 0) {
                            addError('finances', `Année ${year} : le montant du financement ${typeName} ne peut pas être négatif ou nul`);
                        }
                    });
                }
            });
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).send({
                success: false,
                error: {
                    developer_message: 'The submitted data contains errors',
                    user_message: 'Certaines données sont invalides',
                    fields: errors,
                },
            });
        }

        // insert into database
        let finalPlanId;
        try {
            [finalPlanId] = await sequelize.transaction(async (t) => {
                let locationId = null;
                if (planData.locationType === 'location') {
                    const response = await sequelize.query(
                        `INSERT INTO locations(
                            address,
                            latitude,
                            longitude,
                            created_by
                        ) VALUES(
                            :address,
                            :latitude,
                            :longitude,
                            :createdBy
                        ) RETURNING location_id AS id`,
                        {
                            replacements: Object.assign({}, planData.locationAddress, {
                                createdBy: req.user.id,
                            }),
                            transaction: t,
                        },
                    );

                    locationId = response[0][0].id;
                }

                const response = await sequelize.query(
                    `INSERT INTO plans2(
                        name,
                        started_at,
                        expected_to_end_at,
                        in_and_out,
                        goals,
                        fk_category,
                        location_type,
                        location_details,
                        fk_location,
                        created_by
                    ) VALUES(
                        :name,
                        :startedAt,
                        :expectedToEndAt,
                        :inAndOut,
                        :goals,
                        'autre',
                        :locationType,
                        :locationDetails,
                        :fk_location,
                        :createdBy
                    ) RETURNING plan_id AS id`,
                    {
                        replacements: Object.assign({}, planData, {
                            fk_location: locationId,
                        }),
                        transaction: t,
                    },
                );
                const planId = response[0][0].id;

                await sequelize.query(
                    `INSERT INTO plan_departements(fk_plan, fk_departement, created_by)
                    VALUES (:planId, :departement, :createdBy)`,
                    {
                        replacements: {
                            planId,
                            departement: planData.departement,
                            createdBy: req.user.id,
                        },
                        transaction: t,
                    },
                );

                await sequelize.query(
                    `INSERT INTO plan_topics(fk_plan, fk_topic, created_by)
                    VALUES ${planData.topics.map(() => '(?, ?, ?)').join(', ')}`,
                    {
                        replacements: planData.topics.reduce((acc, uid) => [
                            ...acc,
                            planId,
                            uid,
                            req.user.id,
                        ], []),
                        transaction: t,
                    },
                );

                if (planData.locationType === 'shantytowns') {
                    await sequelize.query(
                        `INSERT INTO plan_shantytowns(fk_plan, fk_shantytown, created_by)
                        VALUES ${planData.locationShantytowns.map(() => '(?, ?, ?)').join(', ')}`,
                        {
                            replacements: planData.locationShantytowns.reduce((acc, id) => [
                                ...acc,
                                planId,
                                id,
                                req.user.id,
                            ], []),
                            transaction: t,
                        },
                    );
                }

                // insert into finances
                const financeIds = await Promise.all(
                    planData.finances.map(({ year }) => sequelize.query(
                        'INSERT INTO finances(fk_plan, year, created_by) VALUES (:planId, :year, :createdBy) RETURNING finance_id AS id',
                        {
                            replacements: {
                                planId,
                                year,
                                createdBy: req.user.id,
                            },
                            transaction: t,
                        },
                    )),
                );

                // insert into finance_rows
                await Promise.all(
                    planData.finances.reduce((acc, { data }, index) => [
                        ...acc,
                        ...data.map(({
                            amount, realAmount, type, details,
                        }) => sequelize.query(
                            `INSERT INTO finance_rows(fk_finance, fk_finance_type, amount, real_amount, comments, created_by)
                            VALUES (:financeId, :type, :amount, :realAmount, :comments, :createdBy)`,
                            {
                                replacements: {
                                    financeId: financeIds[index][0][0].id,
                                    type,
                                    amount,
                                    realAmount,
                                    comments: details,
                                    createdBy: req.user.id,
                                },
                                transaction: t,
                            },
                        )),
                    ], []),
                );

                return Promise.all([
                    Promise.resolve(planId),
                    sequelize.query(
                        `INSERT INTO plan_managers(fk_plan, fk_user, created_by)
                        VALUES (:planId, :userId, :createdBy)`,
                        {
                            replacements: {
                                planId,
                                userId: planData.government.id,
                                createdBy: req.user.id,
                            },
                            transaction: t,
                        },
                    ),

                    sequelize.query(
                        `INSERT INTO plan_operators(fk_plan, fk_user, created_by)
                        VALUES (:planId, :userId, :createdBy)`,
                        {
                            replacements: {
                                planId,
                                userId: planData.associationContact,
                                createdBy: req.user.id,
                            },
                            transaction: t,
                        },
                    ),
                ]);
            });
        } catch (error) {
            res.status(500).send({
                success: false,
                error: {
                    user_message: 'Une erreur est survenue lors de l\'écriture en base de données',
                    developer_message: error,
                },
            });
            return next(error);
        }

        return res.status(200).send({
            id: finalPlanId,
        });
    },

    async update(req, res, next) {
        let plan;
        try {
            plan = await models.plan.findOne(req.user, req.params.id);
        } catch (error) {
            res.status(500).send({
                error: {
                    user_message: 'Une erreur est survenue lors de la récupération des données en base',
                    developer_message: `Could not fetch plan #${req.params.id}`,
                },
            });
            return next(error);
        }

        // sanitize data
        const planData = Object.assign({}, sanitize(req.body), {
            updatedBy: req.user.id,
        });

        // validate data
        const errors = {};
        function addError(field, error) {
            if (errors[field] === undefined) {
                errors[field] = [];
            }

            errors[field].push(error);
        }

        let financeTypes;
        try {
            financeTypes = (await models.financeType.findAll()).reduce((acc, type) => Object.assign({}, acc, {
                [type.uid]: type,
            }), {});
        } catch (error) {
            res.status(500).send({
                success: false,
                error: {
                    developer_message: 'Could not fetch the list of finance types from the database',
                    user_message: 'Une erreur de lecture en base de données est survenue',
                },
            });
            return next(error);
        }

        let topics;
        try {
            topics = (await models.topic.findAll()).reduce((acc, topic) => Object.assign({}, acc, {
                [topic.uid]: topic,
            }), {});
        } catch (error) {
            res.status(500).send({
                success: false,
                error: {
                    developer_message: 'Could not fetch the list of topics from the database',
                    user_message: 'Une erreur de lecture en base de données est survenue',
                },
            });
            return next(error);
        }

        if (!planData.name) {
            addError('name', 'Le nom du dispositif est obligatoire');
        }

        if (!planData.startedAt) {
            addError('startedAt', 'La date de début du dispositif est obligatoire');
        }

        if (planData.expectedToEndAt && planData.expectedToEndAt <= planData.startedAt) {
            addError('expectedToEndAt', 'La date de fin du dispositif ne peut pas être antérieure à la date de début');
        }

        if (planData.topics.length === 0) {
            addError('topics', 'Vous devez sélectionner au moins une thématique');
        } else {
            const unknownTopics = planData.topics.filter(uid => topics[uid] === undefined);
            if (unknownTopics.length > 0) {
                addError('topics', `Les thématiques suivantes n'ont pas été reconnues : ${unknownTopics.join(', ')}`);
            }
        }

        if (!planData.goals) {
            addError('goals', 'Les objectifs sont obligatoires');
        }

        if (!planData.government) {
            addError('government', 'Vous devez désigner la personne en charge du pilotage du dispositif');
        } else {
            try {
                const user = await models.user.findOne(planData.government.id);
                if (user === null) {
                    addError('government', 'La personne désignée comme pilote du dispositif n\'a pas été retrouvée en base de données');
                } else if (user.organization.category.uid !== 'public_establishment') {
                    addError('government', 'Le pilote du dispositif doit faire partie d\'un service de l\'état');
                }
            } catch (error) {
                addError('government', 'Une erreur est survenue lors de la validation du pilote du dispositif');
            }
        }

        if (planData.finances) {
            planData.finances.forEach(({ year, data }) => {
                if (year > (new Date()).getFullYear()) {
                    addError('finances', `Il est impossible de saisir les financements pour l'année ${year}`);
                } else {
                    data.forEach(({ amount, type }, index) => {
                        const typeName = financeTypes[type] ? `'${financeTypes[type].name}'` : `de la ligne n°${index + 1}`;

                        if (!type) {
                            addError('finances', `Année ${year} : merci de préciser le type de financement pour la ligne n°${index + 1}`);
                        } else if (financeTypes[type] === undefined) {
                            addError('finances', `Année ${year} : le type de financement de la ligne n°${index + 1} n'est pas reconnu`);
                        }

                        if (Number.isNaN(amount)) {
                            addError('finances', `Année ${year} : le montant du financement ${typeName} est invalide`);
                        } else if (amount <= 0) {
                            addError('finances', `Année ${year} : le montant du financement ${typeName} ne peut pas être négatif ou nul`);
                        }
                    });
                }
            });
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).send({
                success: false,
                error: {
                    developer_message: 'The submitted data contains errors',
                    user_message: 'Certaines données sont invalides',
                    fields: errors,
                },
            });
        }

        // update database
        try {
            await sequelize.transaction(async (t) => {
                // save current state into history
                await historize(plan.id, t);

                // update
                await sequelize.query(
                    'UPDATE plans2 SET name = :name, started_at = :startedAt, expected_to_end_at = :expectedToEndAt, goals = :goals, updated_by = :updatedBy WHERE plan_id = :planId',
                    {
                        replacements: Object.assign({}, planData, { planId: plan.id }),
                        transaction: t,
                    },
                );

                // reset finances and managers
                await Promise.all([
                    sequelize.query('DELETE FROM finances WHERE fk_plan = :planId', { replacements: { planId: plan.id }, transaction: t }),
                    sequelize.query('DELETE FROM plan_managers WHERE fk_plan = :planId', { replacements: { planId: plan.id }, transaction: t }),
                ]);

                // insert into finances
                const financeIds = await Promise.all(
                    planData.finances.map(({ year }) => sequelize.query(
                        'INSERT INTO finances(fk_plan, year, created_by) VALUES (:planId, :year, :createdBy) RETURNING finance_id AS id',
                        {
                            replacements: {
                                planId: plan.id,
                                year,
                                createdBy: req.user.id,
                            },
                            transaction: t,
                        },
                    )),
                );

                // insert into finance_rows
                await Promise.all(
                    planData.finances.reduce((acc, { data }, index) => [
                        ...acc,
                        ...data.map(({
                            amount, realAmount, type, details,
                        }) => sequelize.query(
                            `INSERT INTO finance_rows(fk_finance, fk_finance_type, amount, real_amount, comments, created_by)
                            VALUES (:financeId, :type, :amount, :realAmount, :comments, :createdBy)`,
                            {
                                replacements: {
                                    financeId: financeIds[index][0][0].id,
                                    type,
                                    amount,
                                    realAmount,
                                    comments: details,
                                    createdBy: req.user.id,
                                },
                                transaction: t,
                            },
                        )),
                    ], []),
                );

                // managers
                return sequelize.query(
                    `INSERT INTO plan_managers(fk_plan, fk_user, created_by)
                        VALUES (:planId, :userId, :createdBy)`,
                    {
                        replacements: {
                            planId: plan.id,
                            userId: planData.government.id,
                            createdBy: req.user.id,
                        },
                        transaction: t,
                    },
                );
            });
        } catch (error) {
            res.status(500).send({
                success: false,
                error: {
                    user_message: 'Une erreur est survenue lors de l\'écriture en base de données',
                    developer_message: error,
                },
            });
            return next(error);
        }

        return res.status(200).send({});
    },

    async addState(req, res, next) {
        let plan;
        try {
            plan = await models.plan.findOne(req.user, req.params.id);
        } catch (error) {
            res.status(500).send({
                error: {
                    user_message: 'Une erreur est survenue lors de la récupération des données en base',
                    developer_message: `Could not fetch plan #${req.params.id}`,
                },
            });
            return next(error);
        }

        // sanitize data
        const stateData = Object.assign({}, sanitizeState(plan, req.body), {
            createdBy: req.user.id,
        });

        // validate data
        const errors = {};
        function addError(field, error) {
            if (errors[field] === undefined) {
                errors[field] = [];
            }

            errors[field].push(error);
        }

        let etpTypes;
        try {
            etpTypes = (await models.etpType.findAll()).reduce((acc, type) => Object.assign({}, acc, {
                [type.uid]: type,
            }), {});
        } catch (error) {
            res.status(500).send({
                success: false,
                error: {
                    developer_message: 'Could not fetch the list of etp types from the database',
                    user_message: 'Une erreur de lecture en base de données est survenue',
                },
            });
            return next(error);
        }

        // date
        if (!stateData.date) {
            addError('date', 'La date est obligatoire');
        } else if (plan.states.length > 0 && stateData.date.getTime() <= plan.states.slice(-1)[0].date) {
            // @todo ajouter la date de la dernière saisie ici
            addError('date', 'Vous ne pouvez pas saisir d\'indicateurs pour une date antérieur à la précédente saisie');
        }

        // etp
        if (!stateData.etp || stateData.etp.length === 0) {
            addError('etp', 'Vous devez préciser l\'équipe d\'intervention');
        } else {
            const duplicateEtps = [];
            const usedEtps = [];

            stateData.etp.forEach(({ total, type }, index) => {
                const etpType = etpTypes[type];
                let etpName;
                if (etpType === undefined) {
                    addError('etp', `Le type d'ETP de la ligne n°${index + 1} n'est pas reconnu`);
                    etpName = `la ligne n°${index + 1}`;
                } else {
                    etpName = etpType.name;
                }

                if (total <= 0) {
                    addError('etp', `Le nombre d'ETP pour ${etpName} ne peut pas être négatif ou nul`);
                }

                if (usedEtps.indexOf(type) === -1) {
                    usedEtps.push(type);
                } else if (duplicateEtps.indexOf(type) === -1) {
                    duplicateEtps.push(type);
                    addError('etp', `Merci de ne conserver qu'une seule ligne '${etpName}'`);
                }
            });
        }

        // audience
        const hasBadValues = Object.keys(stateData.audience).some((key) => {
            if (stateData.audience[key] === null) {
                return false;
            }

            return Object.values(stateData.audience[key]).some(value => Number.isNaN(value) || value < 0);
        });
        if (hasBadValues) {
            addError('audience', 'Les chiffres indiqués ne peuvent pas être négatifs');
        }

        if (plan.states.length === 0) {
            if (Number.isNaN(stateData.audience.in.total) || stateData.audience.in.total <= 0) {
                addError('audience', 'Vous devez préciser le nombre de personnes intégrées au dispositif');
            }

            if (Number.isNaN(stateData.audience.in.families) || stateData.audience.in.families <= 0) {
                addError('audience', 'Vous devez préciser le nombre de ménages intégrés au dispositif');
            }
        }

        if (stateData.audience.in.total < stateData.audience.in.families) {
            addError('audience', 'Le nombre de ménages ne peut pas être supérieur au nombre de personnes');
        }
        if (stateData.audience.in.women + stateData.audience.in.minors > stateData.audience.in.total) {
            addError('audience', 'La somme du nombre de femmes et de mineurs ne peut pas être supérieure au nombre de personnes');
        }

        // check new audience
        if (plan.states.length > 0) {
            const newAudience = Object.assign({}, plan.audience);

            newAudience.total += stateData.audience.in.total;
            newAudience.families += stateData.audience.in.families;
            newAudience.women += stateData.audience.in.women;
            newAudience.minors += stateData.audience.in.minors;
            ['out_positive', 'out_abandoned', 'out_excluded'].forEach((key) => {
                if (stateData.audience[key]) {
                    newAudience.total -= stateData.audience[key].total;
                    newAudience.families -= stateData.audience[key].families;
                    newAudience.women -= stateData.audience[key].women;
                    newAudience.minors -= stateData.audience[key].minors;
                }
            });

            if (newAudience.total < 0) {
                addError('audience', `Selon cette saisie, le nouveau nombre de personnes dans le dispositif passerait à ${newAudience.total}, ce qui est impossible`);
            }
            if (newAudience.families < 0) {
                addError('audience', `Selon cette saisie, le nouveau nombre de ménages dans le dispositif passerait à ${newAudience.families}, ce qui est impossible`);
            }
            if (newAudience.women < 0) {
                addError('audience', `Selon cette saisie, le nouveau nombre de femmes dans le dispositif passerait à ${newAudience.women}, ce qui est impossible`);
            }
            if (newAudience.minors < 0) {
                addError('audience', `Selon cette saisie, le nouveau nombre de mineurs dans le dispositif passerait à ${newAudience.minors}, ce qui est impossible`);
            }

            if (newAudience.total < newAudience.families) {
                addError('audience', `Selon cette saisie, le nombre de ménages (${newAudience.families}) deviendrait supérieur au nombre de personnes (${newAudience.total})`);
            }
            if (newAudience.women + newAudience.minors > newAudience.total) {
                addError('audience', `Selon cette saisie, la somme du nombre de femmes (${newAudience.women}) et du nombre de mineurs (${newAudience.minors}) deviendrait supérieure au nombre de personnes (${newAudience.total})`);
            }
        }

        // indicateurs droit commun
        const topics = plan.topics.map(({ uid }) => uid);
        if (stateData.domiciliation !== null && (Number.isNaN(stateData.domiciliation) || stateData.domiciliation < 0)) {
            addError('domiciliation', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
        }
        if (stateData.droits_caf !== null && (Number.isNaN(stateData.droits_caf) || stateData.droits_caf < 0)) {
            addError('droits_caf', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
        }
        if (stateData.emploi_stable !== null && (Number.isNaN(stateData.emploi_stable) || stateData.emploi_stable < 0)) {
            addError('emploi_stable', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
        }

        // indicateurs santé
        if (topics.indexOf('health') !== -1) {
            if (stateData.ame_valide !== null && (Number.isNaN(stateData.ame_valide) || stateData.ame_valide < 0)) {
                addError('ame_valide', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.puma_valide !== null && (Number.isNaN(stateData.puma_valide) || stateData.puma_valide < 0)) {
                addError('puma_valide', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.ame_en_cours !== null && (Number.isNaN(stateData.ame_en_cours) || stateData.ame_en_cours < 0)) {
                addError('ame_en_cours', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.puma_en_cours !== null && (Number.isNaN(stateData.puma_en_cours) || stateData.puma_en_cours < 0)) {
                addError('puma_en_cours', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.orientation !== null && (Number.isNaN(stateData.orientation) || stateData.orientation < 0)) {
                addError('orientation', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.accompagnement !== null && (Number.isNaN(stateData.accompagnement) || stateData.accompagnement < 0)) {
                addError('accompagnement', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
        }

        // indicateurs logement
        if (topics.indexOf('housing') !== -1) {
            const inputs = [
                { name: 'siao', label: 'SIAO' },
                { name: 'logement_social', label: 'Logement social' },
                { name: 'dalo', label: 'DALO' },
                { name: 'accompagnes', label: 'Logement accompagné / adapté' },
                { name: 'non_accompagnes', label: 'Logement sans accompagnement' },
                { name: 'heberges', label: 'Hébergement' },
            ];
            inputs.forEach(({ name, label }) => {
                let families = null;
                if (stateData[name] !== null && (Number.isNaN(stateData[name]) || stateData[name] < 0)) {
                    addError('housing', `La valeur du champ ${label} (ménages) est invalide : veuillez saisir un nombre supérieur à 0`);
                } else {
                    families = stateData[name];
                }

                let people = null;
                if (stateData[`${name}_people`] !== null && (Number.isNaN(stateData[`${name}_people`]) || stateData[`${name}_people`] < 0)) {
                    addError('housing', `La valeur du champ ${label} (personnes) est invalide : veuillez saisir un nombre supérieur à 0`);
                } else {
                    people = stateData[`${name}_people`];
                }

                if (families !== null && people !== null && families > people) {
                    addError('housing', `Le nombre de ménages ne peut pas être supérieur au nombre de personnes pour le champ ${label}`);
                }
            });
        }

        // indicateurs sécurisation
        if (topics.indexOf('safety') !== -1) {
            if (stateData.points_eau !== null && (Number.isNaN(stateData.points_eau) || stateData.points_eau < 0)) {
                addError('points_eau', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.wc !== null && (Number.isNaN(stateData.wc) || stateData.wc < 0)) {
                addError('wc', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.nombre_bennes !== null && (Number.isNaN(stateData.nombre_bennes) || stateData.nombre_bennes < 0)) {
                addError('nombre_bennes', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.electricite !== null && (Number.isNaN(stateData.electricite) || stateData.electricite < 0)) {
                addError('electricite', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
        }

        // indicateurs éducation
        if (topics.indexOf('school') !== -1) {
            if (stateData.scolarisables !== null && (Number.isNaN(stateData.scolarisables) || stateData.scolarisables < 0)) {
                addError('scolarisables', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.en_mediation !== null && (Number.isNaN(stateData.en_mediation) || stateData.en_mediation < 0)) {
                addError('en_mediation', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.maternelles !== null && (Number.isNaN(stateData.maternelles) || stateData.maternelles < 0)) {
                addError('maternelles', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.elementaires !== null && (Number.isNaN(stateData.elementaires) || stateData.elementaires < 0)) {
                addError('elementaires', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.colleges !== null && (Number.isNaN(stateData.colleges) || stateData.colleges < 0)) {
                addError('colleges', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.lycees !== null && (Number.isNaN(stateData.lycees) || stateData.lycees < 0)) {
                addError('lycees', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
        }

        // indicateurs formation
        if (topics.indexOf('work') !== -1) {
            if (stateData.pole_emploi !== null && (Number.isNaN(stateData.pole_emploi) || stateData.pole_emploi < 0)) {
                addError('pole_emploi', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.pole_emploi_femmes !== null && (Number.isNaN(stateData.pole_emploi_femmes) || stateData.pole_emploi_femmes < 0)) {
                addError('pole_emploi_femmes', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.mission_locale !== null && (Number.isNaN(stateData.mission_locale) || stateData.mission_locale < 0)) {
                addError('mission_locale', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.mission_locale_femmes !== null && (Number.isNaN(stateData.mission_locale_femmes) || stateData.mission_locale_femmes < 0)) {
                addError('mission_locale_femmes', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.contrats !== null && (Number.isNaN(stateData.contrats) || stateData.contrats < 0)) {
                addError('contrats', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.contrats_femmes !== null && (Number.isNaN(stateData.contrats_femmes) || stateData.contrats_femmes < 0)) {
                addError('contrats_femmes', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.formations !== null && (Number.isNaN(stateData.formations) || stateData.formations < 0)) {
                addError('formations', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.formations_femmes !== null && (Number.isNaN(stateData.formations_femmes) || stateData.formations_femmes < 0)) {
                addError('formations_femmes', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.autoentrepreneurs !== null && (Number.isNaN(stateData.autoentrepreneurs) || stateData.autoentrepreneurs < 0)) {
                addError('autoentrepreneurs', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.autoentrepreneurs_femmes !== null && (Number.isNaN(stateData.autoentrepreneurs_femmes) || stateData.autoentrepreneurs_femmes < 0)) {
                addError('autoentrepreneurs_femmes', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.are !== null && (Number.isNaN(stateData.are) || stateData.are < 0)) {
                addError('are', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
            if (stateData.are_femmes !== null && (Number.isNaN(stateData.are_femmes) || stateData.are_femmes < 0)) {
                addError('are_femmes', 'Ce champ est obligatoire et sa valeur ne peut pas être négative');
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).send({
                success: false,
                error: {
                    developer_message: 'The submitted data contains errors',
                    user_message: 'Certaines données sont invalides',
                    fields: errors,
                },
            });
        }

        // insert into database
        try {
            await sequelize.transaction(async (t) => {
                const audienceIds = {
                    in: null,
                    out_positive: null,
                    out_abandoned: null,
                    out_excluded: null,
                };

                // audience
                const audiencePromises = [];
                if (plan.states.length === 0 || plan.in_and_out === true) {
                    audiencePromises.push(sequelize.query(
                        'INSERT INTO audiences(total, families, women, minors) VALUES(:total, :families, :women, :minors) RETURNING audience_id AS id',
                        {
                            replacements: {
                                total: stateData.audience.in.total,
                                families: stateData.audience.in.families,
                                women: stateData.audience.in.women,
                                minors: stateData.audience.in.minors,
                            },
                            transaction: t,
                        },
                    ));
                } else {
                    audiencePromises.push(Promise.resolve(null));
                }

                if (plan.states.length > 0) {
                    audiencePromises.push(sequelize.query(
                        'INSERT INTO audiences(total, families, women, minors) VALUES(:total, :families, :women, :minors) RETURNING audience_id AS id',
                        {
                            replacements: {
                                total: stateData.audience.out_positive.total,
                                families: stateData.audience.out_positive.families,
                                women: stateData.audience.out_positive.women,
                                minors: stateData.audience.out_positive.minors,
                            },
                            transaction: t,
                        },
                    ));
                    audiencePromises.push(sequelize.query(
                        'INSERT INTO audiences(total, families, women, minors) VALUES(:total, :families, :women, :minors) RETURNING audience_id AS id',
                        {
                            replacements: {
                                total: stateData.audience.out_abandoned.total,
                                families: stateData.audience.out_abandoned.families,
                                women: stateData.audience.out_abandoned.women,
                                minors: stateData.audience.out_abandoned.minors,
                            },
                            transaction: t,
                        },
                    ));
                    audiencePromises.push(sequelize.query(
                        'INSERT INTO audiences(total, families, women, minors) VALUES(:total, :families, :women, :minors) RETURNING audience_id AS id',
                        {
                            replacements: {
                                total: stateData.audience.out_excluded.total,
                                families: stateData.audience.out_excluded.families,
                                women: stateData.audience.out_excluded.women,
                                minors: stateData.audience.out_excluded.minors,
                            },
                            transaction: t,
                        },
                    ));
                } else {
                    audiencePromises.push(Promise.resolve(null));
                    audiencePromises.push(Promise.resolve(null));
                    audiencePromises.push(Promise.resolve(null));
                }

                const [inId, outPositiveId, outAbandonedId, outExcludedId] = await Promise.all(audiencePromises);
                audienceIds.in = inId !== null ? inId[0][0].id : null;
                audienceIds.out_positive = outPositiveId !== null ? outPositiveId[0][0].id : null;
                audienceIds.out_abandoned = outAbandonedId !== null ? outAbandonedId[0][0].id : null;
                audienceIds.out_excluded = outExcludedId !== null ? outExcludedId[0][0].id : null;

                // indicateurs droit commun
                const indicateurPromises = [];
                indicateurPromises.push(
                    sequelize.query(
                        `INSERT INTO indicateurs_droit_commun(domiciliation, droits_caf, emploi_stable, created_by)
                        VALUES(:domiciliation, :droits_caf, :emploi_stable, :createdBy)
                        RETURNING indicateurs_droit_commun_id AS id`,
                        {
                            replacements: stateData,
                            transaction: t,
                        },
                    ),
                );

                // indicateurs santé
                if (topics.indexOf('health') !== -1) {
                    indicateurPromises.push(
                        sequelize.query(
                            `INSERT INTO indicateurs_sante(ame_valide, puma_valide, ame_en_cours, puma_en_cours, orientation, accompagnement, created_by)
                            VALUES(:ame_valide, :puma_valide, :ame_en_cours, :puma_en_cours, :orientation, :accompagnement, :createdBy)
                            RETURNING indicateurs_sante_id AS id`,
                            {
                                replacements: stateData,
                                transaction: t,
                            },
                        ),
                    );
                } else {
                    indicateurPromises.push(Promise.resolve(null));
                }

                // indicateurs logement
                if (topics.indexOf('housing') !== -1) {
                    indicateurPromises.push(
                        sequelize.query(
                            `INSERT INTO indicateurs_logement(siao, siao_people, logement_social, logement_social_people, dalo, dalo_people, accompagnes, accompagnes_people, non_accompagnes, non_accompagnes_people, heberges, heberges_people, created_by)
                            VALUES(:siao, :siao_people, :logement_social, :logement_social_people, :dalo, :dalo_people, :accompagnes, :accompagnes_people, :non_accompagnes, :non_accompagnes_people, :heberges, :heberges_people, :createdBy)
                            RETURNING indicateurs_logement_id AS id`,
                            {
                                replacements: stateData,
                                transaction: t,
                            },
                        ),
                    );
                } else {
                    indicateurPromises.push(Promise.resolve(null));
                }

                // indicateurs sécurisation
                if (topics.indexOf('safety') !== -1) {
                    indicateurPromises.push(
                        sequelize.query(
                            `INSERT INTO indicateurs_securisation(points_eau, wc, nombre_bennes, electricite, created_by)
                            VALUES(:points_eau, :wc, :nombre_bennes, :electricite, :createdBy)
                            RETURNING indicateurs_securisation_id AS id`,
                            {
                                replacements: stateData,
                                transaction: t,
                            },
                        ),
                    );
                } else {
                    indicateurPromises.push(Promise.resolve(null));
                }

                // indicateurs éducation
                if (topics.indexOf('school') !== -1) {
                    indicateurPromises.push(
                        sequelize.query(
                            `INSERT INTO indicateurs_education(scolarisables, en_mediation, maternelles, elementaires, colleges, lycees, difficulte_cantine, difficculte_place_up2a, difficulte_transport, created_by)
                            VALUES(:scolarisables, :en_mediation, :maternelles, :elementaires, :colleges, :lycees, :difficulte_cantine, :difficulte_place_up2a, :difficulte_transport, :createdBy)
                            RETURNING indicateurs_education_id AS id`,
                            {
                                replacements: stateData,
                                transaction: t,
                            },
                        ),
                    );
                } else {
                    indicateurPromises.push(Promise.resolve(null));
                }

                // indicateurs formation
                if (topics.indexOf('work') !== -1) {
                    indicateurPromises.push(
                        sequelize.query(
                            `INSERT INTO indicateurs_formation(pole_emploi, pole_emploi_femmes, mission_locale, mission_locale_femmes, contrats, contrats_femmes, formations, formations_femmes, autoentrepreneurs, autoentrepreneurs_femmes, are, are_femmes, created_by)
                            VALUES(:pole_emploi, :pole_emploi_femmes, :mission_locale, :mission_locale_femmes, :contrats, :contrats_femmes, :formations, :formations_femmes, :autoentrepreneurs, :autoentrepreneurs_femmes, :are, :are_femmes, :createdBy)
                            RETURNING indicateurs_formation_id AS id`,
                            {
                                replacements: stateData,
                                transaction: t,
                            },
                        ),
                    );
                } else {
                    indicateurPromises.push(Promise.resolve(null));
                }

                const [commun, sante, logement, securisation, education, formation] = await Promise.all(indicateurPromises);
                const indicateurIds = {
                    commun: commun[0][0].id,
                    sante: sante ? sante[0][0].id : null,
                    logement: logement ? logement[0][0].id : null,
                    securisation: securisation ? securisation[0][0].id : null,
                    education: education ? education[0][0].id : null,
                    formation: formation ? formation[0][0].id : null,
                };

                const response = await sequelize.query(
                    `INSERT INTO plan_states(
                        date,
                        fk_plan,
                        fk_audience_in,
                        fk_audience_out_positive,
                        fk_audience_out_abandoned,
                        fk_audience_out_excluded,
                        fk_indicateurs_commun,
                        fk_indicateurs_sante,
                        fk_indicateurs_logement,
                        fk_indicateurs_formation,
                        fk_indicateurs_education,
                        fk_indicateurs_securisation,
                        created_by
                    ) VALUES(
                        :date,
                        :planId,
                        :in,
                        :out_positive,
                        :out_abandoned,
                        :out_excluded,
                        :commun,
                        :sante,
                        :logement,
                        :formation,
                        :education,
                        :securisation,
                        :createdBy
                    ) RETURNING plan_state_id AS id`,
                    {
                        replacements: Object.assign(
                            {
                                planId: plan.id,
                            },
                            stateData,
                            audienceIds,
                            indicateurIds,
                        ),
                        transaction: t,
                    },
                );
                // stateData.etp
                const planStateId = response[0][0].id;
                return sequelize.query(
                    `INSERT INTO plan_state_etp(
                        fk_plan_state,
                        fk_etp_type,
                        total,
                        created_by
                    ) VALUES ${stateData.etp.map(() => '(?, ?, ?, ?)').join(', ')}`,
                    {
                        replacements: stateData.etp.reduce((acc, { total, type }) => [
                            ...acc,
                            planStateId,
                            type,
                            total,
                            req.user.id,
                        ], []),
                        transaction: t,
                    },
                );
            });
        } catch (error) {
            res.status(500).send({
                success: false,
                error: {
                    user_message: 'Une erreur est survenue lors de l\'écriture en base de données',
                    developer_message: error,
                },
            });
            return next(error);
        }

        // insert into database
        return res.status(200).send({});
    },

    async link(req, res, next) {
        try {
            await models.plan.addTown(req.params.id, req.body.townId, req.user.id);
        } catch (error) {
            res.status(500).send({
                error: {
                    user_message: 'Une erreur est survenue lors de l\'écriture des données en base',
                },
            });
            return next(error);
        }

        return res.status(200).send({});
    },

    async delete(req, res) {
        try {
            await models.plan.delete(req.params.id);
        } catch (error) {
            res.status(500).send({
                error: {
                    user_message: 'Une erreur est survenue lors de l\'écriture des données en base',
                    developer_message: error,
                },
            });
        }

        return res.status(200).send({});
    },

    async close(req, res, next) {
        // check existence of the plan (otherwise, 404)
        let plan;
        try {
            plan = await models.plan.findOne(req.user, req.params.id);
        } catch (error) {
            res.status(500).send({
                error: {
                    user_message: 'Une erreur est survenue lors de la récupération des données en base',
                    developer_message: `Could not fetch plan #${req.params.id}`,
                },
            });
            return next(error);
        }

        if (plan === null) {
            return res.status(404).send({
                error: {
                    user_message: 'Le dispositif à mettre à jour n\'a pas été trouvé en base de données',
                    developer_message: `Could not find plan #${req.params.id}`,
                },
            });
        }

        // check the geographic level of the 'close' permission (we assume here that the user has that permission)
        if (plan.canClose !== true) {
            return res.status(400).send({
                error: {
                    user_message: 'Vous n\'avez pas les droits nécessaires pour fermer ce dispositif',
                },
            });
        }

        // ensure the plan is not already closed (otherwise, 400)
        if (plan.closed_at !== null) {
            return res.status(400).send({
                error: {
                    user_message: 'Ce dispositif est déjà fermé',
                },
            });
        }

        // check the input
        const planData = Object.assign({}, sanitizeClose(req.body.data), {
            updatedBy: req.user.id,
        });

        const errors = {};
        function addError(field, error) {
            if (errors[field] === undefined) {
                errors[field] = [];
            }

            errors[field].push(error);
        }

        // find all missing realAmount entries and ensure they were sent and are valid (ie., they are floats > 0 && <= to amount)
        function extractRealAmount(year, type, amount) {
            const finance = planData.finances.find(({ year: y }) => y === year);
            if (!finance) {
                return null;
            }

            const index = finance.data.findIndex(({ amount: a, type: t }) => a === amount && t === type);
            const [{ realAmount }] = finance.data.splice(index, 1);

            return realAmount;
        }

        const cleanFinances = plan.finances.map(finance => Object.assign({}, finance, {
            data: finance.data.map((row) => {
                const realAmount = extractRealAmount(finance.year, row.type.uid, row.amount);
                if (row.realAmount !== null) {
                    return Object.assign({}, row, {
                        type: row.type.uid,
                    });
                }

                if (realAmount < 0) {
                    addError('finances', `Financements ${finance.year} : les dépenses exécutées ne peuvent pas être négatives`);
                } else if (realAmount > row.amount) {
                    addError('finances', `Financements ${finance.year} : les dépenses exécutées ne peuvent pas être supérieures au montant du financement`);
                }

                return Object.assign({}, row, {
                    type: row.type.uid,
                    realAmount,
                });
            }),
        }));

        if (planData.finances.some(({ data }) => data.length > 0)) {
            addError('finances', 'Le tableau de financement ne peut pas être modifié, à l\'exception des dépenses exécutées');
        } else {
            planData.finances = cleanFinances;
        }

        // ensure the closed date is provided and is > startedAt and <= today
        if (planData.closedAt === undefined) {
            addError('closedAt', 'La date de fermeture est obligatoire');
        } else if (planData.closedAt >= new Date()) {
            addError('closedAt', 'La date de fermeture ne peut pas être future');
        } else if (planData.closedAt <= new Date(plan.started_at)) {
            addError('closedAt', 'La date de fermeture ne peut pas être antérieure à la date de début du dispositif');
        }

        // ensure the comment is not empty
        if (planData.comment === undefined || planData.comment === '') {
            addError('comment', 'Le commentaire est obligatoire');
        }

        // in case of error => 400 + details
        if (Object.keys(errors).length > 0) {
            return res.status(400).send({
                error: {
                    user_message: 'Certaines données sont invalides',
                    fields: errors,
                },
            });
        }

        // start a transaction
        try {
            await sequelize.transaction(async (t) => {
                // save current state into history
                await historize(plan.id, t);

                // update
                await sequelize.query(
                    'UPDATE plans2 SET closed_at = :closedAt, final_comment = :comment, updated_by = :updatedBy WHERE plan_id = :planId',
                    {
                        replacements: Object.assign({}, planData, { planId: plan.id }),
                        transaction: t,
                    },
                );

                // reset finances
                await sequelize.query('DELETE FROM finances WHERE fk_plan = :planId', { replacements: { planId: plan.id }, transaction: t });

                // insert into finances
                const financeIds = await Promise.all(
                    planData.finances.map(({ year }) => sequelize.query(
                        'INSERT INTO finances(fk_plan, year, created_by) VALUES (:planId, :year, :createdBy) RETURNING finance_id AS id',
                        {
                            replacements: {
                                planId: plan.id,
                                year,
                                createdBy: req.user.id,
                            },
                            transaction: t,
                        },
                    )),
                );

                // insert into finance_rows
                return Promise.all(
                    planData.finances.reduce((acc, { data }, index) => [
                        ...acc,
                        ...data.map(({
                            amount, realAmount, type, details,
                        }) => sequelize.query(
                            `INSERT INTO finance_rows(fk_finance, fk_finance_type, amount, real_amount, comments, created_by)
                            VALUES (:financeId, :type, :amount, :realAmount, :comments, :createdBy)`,
                            {
                                replacements: {
                                    financeId: financeIds[index][0][0].id,
                                    type,
                                    amount,
                                    realAmount,
                                    comments: details,
                                    createdBy: req.user.id,
                                },
                                transaction: t,
                            },
                        )),
                    ], []),
                );
            });
        } catch (error) {
            res.status(500).send({
                error: {
                    user_message: 'Une erreur est survenue lors de l\'écriture en base de données',
                    developer_message: error.message,
                },
            });
            return next(error);
        }

        return res.status(200).send({});
    },

});
