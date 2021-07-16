/* eslint-disable newline-per-chained-call */
const { body } = require('express-validator');
const { sequelize } = require('#db/models');
const userModel = require('#server/models/userModel')(sequelize);

module.exports = [

    body('invite_from')
        .isString().bail().withMessage('L\'origine de l\'invitation est invalide')
        .trim()
        .notEmpty().bail().withMessage('L\'origine de l\'invitation est obligatoire'),

    body('greeter.email')
        .trim()
        .notEmpty().bail().withMessage('Le courriel de la personne a l\'initiative de l\'invitation doit être renseigné')
        .isEmail().bail().withMessage('Le courriel de la personne a l\'initiative de l\'invitation n\'est pas valide')
        .normalizeEmail({
            gmail_remove_dots: false,
            gmail_remove_subaddress: false,
            gmail_convert_googlemaildotcom: false,
            outlookdotcom_remove_subaddress: false,
            yahoo_remove_subaddress: false,
            icloud_remove_subaddress: false,
        }),

    body('greeter.first_name')
        .isString().bail().withMessage('Le prénom de la personne à l\'initiative de l\'invitation est invalide')
        .trim()
        .notEmpty().bail().withMessage('Le prénom de la personne à l\'initiative de l\'invitation est obligatoire'),

    body('greeter.last_name')
        .isString().bail().withMessage('Le nom de la personne à l\'initiative de l\'invitation est invalide')
        .trim()
        .notEmpty().bail().withMessage('Le nom de la personne à l\'initiative de l\'invitation est obligatoire'),

    body('guests')
        .customSanitizer((value) => {
            if (value === undefined || value === null) {
                return [];
            }
            return value;
        })
        .isArray().bail().withMessage('La liste des invités n\'est pas valide')
        .notEmpty().bail().withMessage('La liste des invités ne peut pas être vide'),

    body('guests.*.first_name')
        .trim()
        .notEmpty().bail().withMessage('Vous devez préciser le prénom de l\'invité(e)'),

    body('guests.*.last_name')
        .trim()
        .notEmpty().bail().withMessage('Vous devez préciser le nom de l\'invité(e)'),

    body('guests.*.email')
        .trim()
        .notEmpty().bail().withMessage('Vous devez préciser le courriel de l\'invité(e)')
        .isEmail().bail().withMessage('Le courriel d\'au moins une invitation n\'est pas valide')
        .normalizeEmail({
            gmail_remove_dots: false,
            gmail_remove_subaddress: false,
            gmail_convert_googlemaildotcom: false,
            outlookdotcom_remove_subaddress: false,
            yahoo_remove_subaddress: false,
            icloud_remove_subaddress: false,
        })
        .custom(async (value) => {
            let user = null;
            try {
                user = await userModel.findOneByEmail(value);
            } catch (error) {
                throw new Error('Erreur lors du contrôle de l\'existence d\'un utilisateur à partir de son courriel');
            }
            if (user !== null) {
                if (Object.keys(user).length > 0) {
                    /* TODO: faire remonter cette erreur quand la fonctionnalité permettant de récupérer le détail de l'erreur sera implémentée côté front.
                       Pour l'instant, on ne bloque pas l'envoi du courriel d'invitation, même si l'utilisateur invité existe déjà dans la table des users
                       Pour éviter de bloquer l'envoi des autres invitations */
                    // throw new Error('Un utilisateur ayant ce courriel existe déjà');
                }
            }
            return true;
        }),
];
