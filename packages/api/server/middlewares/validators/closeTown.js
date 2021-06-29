/* eslint-disable newline-per-chained-call */
const { body, param } = require('express-validator');
const { sequelize } = require('#db/models');
const shantytownModel = require('#server/models/shantytownModel')(sequelize);
const closingSolutionModel = require('#server/models/closingSolutionModel')(sequelize);

module.exports = [
    param('id')
        .toInt()
        .isInt().bail().withMessage('L\'identifiant du site est invalide')
        .custom(async (value, { req }) => {
            let shantytown;
            try {
                shantytown = await shantytownModel.findOne(req.user, value);
            } catch (error) {
                throw new Error('Une erreur est survenue lors de la recherche du site en base de données');
            }

            if (shantytown === null) {
                throw new Error('Le site à fermer est introuvable en base de données');
            }

            if (shantytown.status !== 'open') {
                throw new Error('Ce site est déjà marqué comme fermé');
            }

            req.body.shantytown = shantytown;
            return true;
        }),

    body('closed_with_solutions')
        .isBoolean().bail().withMessage('Vous devez indiquer si le site a été résorbé définitivement')
        .customSanitizer(value => (value === true ? 'yes' : 'no')),

    body('closed_at')
        .exists({ checkNull: true }).bail().withMessage('Le champ "Date de signalement du site" est obligatoire')
        .isDate().bail().withMessage('Le champ "Date de la fermeture du site" est invalide')
        .toDate()
        .custom((value, { req }) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (value > today) {
                throw new Error('La date de la fermeture du site ne peut pas être future');
            }

            if (req.body.shantytown && req.body.shantytown.declaredAt) {
                const declaredDate = new Date(req.body.shantytown.declaredAt * 1000);
                declaredDate.setHours(0, 0, 0, 0);

                if (value < declaredDate) {
                    throw new Error('La date de la fermeture du site ne peut pas être antérieure à la date d\'installation');
                }
            }

            return true;
        }),

    body('status')
        .exists({ checkNull: true }).bail().withMessage('Le champ "Cause de la disparition" est obligatoire')
        .isString().bail().withMessage('Le champ "Cause de la disparition" est invalide')
        .isIn(['closed_by_justice', 'closed_by_admin', 'other', 'unknown']).bail().withMessage('La valeur du champ "Cause de la disparition" est invalide'),

    body('solutions')
        .customSanitizer((value) => {
            if (value === undefined || value === null) {
                return [];
            }

            return value;
        })
        .isArray().bail().withMessage('La liste des orientations n\'est pas valide')
        .customSanitizer(value => value.map(({ id, peopleAffected, householdsAffected }) => ({
            id: parseInt(id, 10),
            people_affected: peopleAffected !== undefined && peopleAffected !== null
                ? parseInt(peopleAffected, 10) : null,
            households_affected: householdsAffected !== undefined && householdsAffected !== null
                ? parseInt(householdsAffected, 10) : null,
        })))
        .custom(async (values) => {
            let closingSolutions;
            try {
                closingSolutions = await closingSolutionModel.findAll();
            } catch (error) {
                throw new Error('Une erreur est survenue lors de la validation des orientations des ménages');
            }

            // on vérifie chaque orientation séparément pour s'assurer qu'elles sont toutes valides
            values.forEach(({ id, people_affected, households_affected }, index) => {
                const closingSolution = closingSolutions.find(({ id: cId }) => cId === id);
                if (!closingSolution) {
                    throw new Error(`L'orientation n°${index + 1} est de type inconnu`);
                }

                if (people_affected !== null) {
                    if (!Number.isInteger(people_affected)) {
                        throw new Error(`Le nombre de personnes concernées par l'orientation "${closingSolution.label}" est invalide`);
                    } else if (people_affected < 0) {
                        throw new Error(`Le nombre de personnes concernées par l'orientation "${closingSolution.label}" ne peut pas être négatif`);
                    }
                }

                if (households_affected !== null) {
                    if (!Number.isInteger(households_affected)) {
                        throw new Error(`Le nombre de ménages concernés par l'orientation "${closingSolution.label}" est invalide`);
                    } else if (households_affected < 0) {
                        throw new Error(`Le nombre de ménages concernés par l'orientation "${closingSolution.label}" ne peut pas être négatif`);
                    } else if (Number.isInteger(people_affected) && households_affected > people_affected) {
                        throw new Error(`Le nombre de ménages concernés par l'orientation "${closingSolution.label}" ne peut pas être supérieur au nombre de personnes`);
                    }
                }
            });

            // on vérifie que l'on a pas de types d'orientation en double
            const deduplicatedValues = values.reduce((acc, { id }) => {
                if (!acc.includes(id)) {
                    return [...acc, id];
                }

                return acc;
            }, []);

            if (deduplicatedValues.length !== values.length) {
                throw new Error('Il est interdit de saisir plusieurs fois le même type d\'orientation');
            }

            return true;
        }),
];
