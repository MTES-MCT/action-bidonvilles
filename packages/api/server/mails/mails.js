const moment = require('moment');
const mailService = require('#server/services/mailService');
const { frontUrl, backUrl } = require('#server/config');

const generateTrackingUTM = require('./generateTrackingUTM');

const formationUrl = 'https://app.evalandgo.com/s/index.php?a=JTk2cCU5N2slOUElQjA=&id=JTk4ayU5QW4lOTYlQUY=';
const connexionUrl = `${frontUrl}/connexion`;
const contactUrl = `${frontUrl}/contact`;
const adminGuideUrl = `${backUrl}/assets/guide_utilisateur/guide_admin_2020_06.pdf`;
const userGuideUrl = `${backUrl}/assets/guide_utilisateur/guide_utilisateur_2021_02.pdf`;
const invitationUrl = `${frontUrl}/invitation`;
const idealcoUrl = 'https://www.idealco.fr/campagne/?utm_campaign=g-386-3036d540';
const surveyUrl = 'https://app.evalandgo.com/s/index.php?id=JTk4ciU5MXAlOUUlQUU%3D&a=JTk2cCU5N2slOUElQjA%3D';

const ADMIN_CAMPAIGN = 'admin-email';
const REQUESTER_CAMPAIGN = 'demandeur-email';
const USER_CAMPAIGN = 'utilisateur-email';
const INVITE_CAMPAIGN = 'invite-email';

const formatName = (firstName, lastName) => `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.toUpperCase()}`;

module.exports = {
    formatName,

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendAdminAccessActivated: (recipient, options = {}) => {
        const { preserveRecipient = false, variables } = options;

        const utm = generateTrackingUTM(ADMIN_CAMPAIGN, 'compte-active');

        return mailService.send('admin_access_activated', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                userName: variables.userName,
                frontUrl: `${frontUrl}?${utm}`,
                formationUrl,
                backUrl,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendAdminAccessExpired: (recipient, options = {}) => {
        const { variables, preserveRecipient = false } = options;

        const utm = generateTrackingUTM(ADMIN_CAMPAIGN, 'compte-non-active');

        return mailService.send('admin_access_expired', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                userName: variables.userName,
                activationUrlSentDate: variables.activationUrlSentDate,
                frontUrl: `${frontUrl}?${utm}`,
                adminUrl: `${variables.adminUrl}?${utm}`,
                connexionUrl: `${variables.adminUrl}?${utm}`,
                backUrl,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendAdminContactMessage: (recipient, options = {}) => {
        const { variables, preserveRecipient = false, replyTo } = options;

        return mailService.send('admin_contact_message', {
            recipient,
            variables: {
                backUrl,
                message: variables.message,
            },
            preserveRecipient,
            replyTo,
        });
    },


    /**
   * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
   * @param {Object} options
   */
    sendAdminNewRequestNotification: (recipient, options = {}) => {
        const { preserveRecipient = false, variables } = options;

        const utm = generateTrackingUTM(ADMIN_CAMPAIGN, 'nouvelle-demande-acces');

        return mailService.send('admin_new_request_notification', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                userName: variables.userName,
                orgName: variables.orgName,
                frontUrl: `${frontUrl}?${utm}`,
                adminUrl: `${variables.adminUrl}?${utm}`,
                connexionUrl: `${variables.adminUrl}?${utm}`,
                formationUrl,
                backUrl,
            },
            preserveRecipient,
        });
    },
    /**
   * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
   * @param {Object} options
   */
    sendAdminRequestPendingReminder1: (recipient, options = {}) => {
        const { preserveRecipient = false, variables } = options;

        const utm = generateTrackingUTM(
            ADMIN_CAMPAIGN,
            'nouvelle-demande-acces-3j',
        );

        return mailService.send('admin_request_pending_reminder_1', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                userName: variables.userName,
                orgName: variables.orgName,
                frontUrl: `${frontUrl}?${utm}`,
                adminUrl: `${variables.adminUrl}?${utm}`,
                connexionUrl: `${variables.adminUrl}?${utm}`,
                backUrl,
            },
            preserveRecipient,
        });
    },
    /**
   * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
   * @param {Object} options
   */
    sendAdminRequestPendingReminder2: (recipient, options = {}) => {
        const { preserveRecipient = false, variables } = options;

        const utm = generateTrackingUTM(
            ADMIN_CAMPAIGN,
            'nouvelle-demande-acces-10j',
        );

        return mailService.send('admin_request_pending_reminder_2', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                userName: variables.userName,
                orgName: variables.orgName,
                frontUrl: `${frontUrl}?${utm}`,
                adminUrl: `${variables.adminUrl}?${utm}`,
                connexionUrl: `${variables.adminUrl}?${utm}`,
                backUrl,
            },
            preserveRecipient,
        });
    },


    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendAdminWelcome: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(ADMIN_CAMPAIGN, 'bienvenue');

        return mailService.send('admin_welcome', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                connexionUrl: `${connexionUrl}?${utm}`,
                adminGuideUrl,
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserDemoInvitation: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(USER_CAMPAIGN, 'formation-invitation');

        return mailService.send('demo_invitation', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                formationUrl,
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserPlatformInvitation: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;

        const utm = generateTrackingUTM(INVITE_CAMPAIGN, 'decouvre-demande-acces');

        return mailService.send('platform_invitation', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                inviterName: variables.inviterName,
                frontUrl: `${frontUrl}?${utm}`,
                backUrl,
                contactUrl: `${contactUrl}?${utm}`,
                formationUrl,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserShantytownActorInvitation: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;

        const utm = generateTrackingUTM(INVITE_CAMPAIGN, 'partage-demande-acces');

        return mailService.send('shantytown_actor_invitation', {
            recipient,
            variables: {
                inviterName: variables.inviterName,
                siteUrl: `${frontUrl}/site/${variables.shantytown.id}?${utm}`,
                siteAddress: `${variables.shantytown.addressSimple}${variables.shantytown.name ? ` « ${variables.shantytown.name} »` : ''}`,
                connexionUrl: `${connexionUrl}?${utm}`,
                contactUrl: `${contactUrl}?${utm}`,
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserShantytownActorNotification: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;

        const utm = generateTrackingUTM(USER_CAMPAIGN, 'invitation-intervenant');

        return mailService.send('shantytown_actor_notification', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                inviterName: variables.inviterName,
                siteUrl: `${frontUrl}/site/${variables.shantytown.id}?${utm}`,
                actionUrl: `${frontUrl}/site/${variables.shantytown.id}?${utm}&action=new_actor`,
                siteAddress: `${variables.shantytown.addressSimple}${variables.shantytown.name ? ` « ${variables.shantytown.name} »` : ''}`,
                contactUrl,
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserAccessActivatedWelcome: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(USER_CAMPAIGN, 'bienvenue-connexion');

        return mailService.send('user_access_activated_welcome', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                userGuideUrl,
                frontUrl: `${frontUrl}?${utm}`,
                backUrl,
                formationUrl,
                connexionUrl: `${connexionUrl}?${utm}`,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserAccessDenied: (recipient, options = {}) => {
        const { variables, preserveRecipient, replyTo } = options;

        const utm = generateTrackingUTM(REQUESTER_CAMPAIGN, 'demande-refusee');

        return mailService.send('user_access_denied', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                adminName: variables.adminName,
                frontUrl: `${frontUrl}?${utm}`,
                backUrl,
            },
            preserveRecipient,
            replyTo,
        });
    },


    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserAccessExpired: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(REQUESTER_CAMPAIGN, 'demande-expiree');

        return mailService.send('user_access_expired', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                frontUrl: `${frontUrl}?${utm}`,
                backUrl,
                formationUrl,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserAccessGranted: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;

        const utm = generateTrackingUTM(REQUESTER_CAMPAIGN, 'activer-mon-compte');

        return mailService.send('user_access_granted', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                adminName: variables.adminName,
                frontUrl: `${frontUrl}?${utm}`,
                backUrl,
                formationUrl,
                activationUrl: `${variables.activationUrl}?${utm}`,
                activationUrlExpDate: variables.activationUrlExpDate,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserAccessPending: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;

        const utm = generateTrackingUTM(
            REQUESTER_CAMPAIGN,
            'activer-mon-compte-48h',
        );

        return mailService.send('user_access_pending', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                activationUrl: `${variables.activationUrl}?${utm}`,
                activationUrlExpDate: variables.activationUrlExpDate,
                formationUrl,
                frontUrl: `${frontUrl}?${utm}`,
                backUrl,
            },
            preserveRecipient,
        });
    },


    /**
   * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
   * @param {Object} options
   */
    sendUserAccessRequestConfirmation: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(
            REQUESTER_CAMPAIGN,
            'accuse-demande',
        );

        return mailService.send('user_access_request_confirmation', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                frontUrl: `${frontUrl}?${utm}`,
                backUrl,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserCommentDeletion: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;
        const utm = generateTrackingUTM(USER_CAMPAIGN, 'suppression-commentaire');

        return mailService.send('user_comment_deletion', {
            recipient,
            variables: {
                town: variables.town,
                comment: variables.comment,
                message: variables.message,
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserFeatures: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(USER_CAMPAIGN, '4S-connexion');

        return mailService.send('user_features', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                connexionUrl: `${connexionUrl}?${utm}`,
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
            },
            preserveRecipient,
        });
    },

    /**
   * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
   * @param {Object} options
   */
    sendUserIdealcoInvitation: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(USER_CAMPAIGN, '3S-idealco');

        return mailService.send('user_idealco_invitation', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                idealcoUrl,
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserNewComment: (recipient, options = {}) => {
        const { variables, preserveRecipient = false } = options;

        const utm = generateTrackingUTM(USER_CAMPAIGN, 'nouveau-commentaire');

        return mailService.send('user_new_comment', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
                shantytown: variables.shantytown,
                comment: variables.comment,
                annuaireUrl: `${frontUrl}/annuaire/${variables.comment.createdBy.organizationId}?${utm}`,
                messageUrl: `${frontUrl}/site/${variables.shantytown.id}#newComment`,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserNewPassword: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;

        return mailService.send('user_new_password', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                backUrl,
                link: variables.link,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserReview: (recipient, options = {}) => {
        const { preserveRecipient } = options;
        const utm = generateTrackingUTM(USER_CAMPAIGN, '12S-votre-avis');

        return mailService.send('user_review', {
            recipient,
            variables: {
                surveyUrl,
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
                connexionUrl: `${connexionUrl}?${utm}`,
                recipientName: formatName(recipient.first_name, recipient.last_name),
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserShantytownDeclared: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;
        const utm = {
            regular: generateTrackingUTM(USER_CAMPAIGN, `dep${variables.departement.code}-nouveau-site`),
            connexion: generateTrackingUTM(USER_CAMPAIGN, `dep${variables.departement.code}-nouveau-site-connexion`),
        };

        return mailService.send('user_shantytown_declared', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                departementName: variables.departement.name,
                hour: moment(variables.shantytown.createdAt).utcOffset(2).format('HH:mm'),
                creatorName: formatName(variables.creator.first_name, variables.creator.last_name),
                townFullAddress: variables.shantytown.address,
                frontUrl: `${frontUrl}?${utm.regular}`,
                connexionUrl: `${connexionUrl}?${utm.connexion}`,
                townUrl: `${frontUrl}/site/${variables.shantytown.id}?${utm.regular}`,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserShantytownClosed: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;
        const utm = {
            regular: generateTrackingUTM(USER_CAMPAIGN, `dep${variables.departement.code}-site-ferme`),
            connexion: generateTrackingUTM(USER_CAMPAIGN, `dep${variables.departement.code}-site-ferme-connexion`),
        };

        return mailService.send('user_shantytown_closed', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                departementName: variables.departement.name,
                hour: moment(variables.shantytown.closedAt).utcOffset(2).format('HH:mm'),
                editorName: formatName(variables.editor.first_name, variables.editor.last_name),
                townFullAddress: variables.shantytown.address,
                frontUrl: `${frontUrl}?${utm.regular}`,
                connexionUrl: `${connexionUrl}?${utm.connexion}`,
                townUrl: `${frontUrl}/site/${variables.shantytown.id}?${utm.regular}`,
            },
            preserveRecipient,
        });
    },

    /**
     * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
     * @param {Object} options
     */
    sendUserShare: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(USER_CAMPAIGN, '8S-partage-plateforme');

        return mailService.send('user_share', {
            recipient,
            variables: {
                recipientName: formatName(recipient.first_name, recipient.last_name),
                invitationUrl: `${invitationUrl}?email=${encodeURIComponent(recipient.email)}&first_name=${recipient.first_name}&last_name=${recipient.last_name}&from=push_mail&${utm}`,
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
            },
            preserveRecipient,
        });
    },
};
