const { send: sendMail } = require('#server/services/mailService');
const { frontUrl } = require('#server/config');

const generateTrackingUTM = require('./generateTrackingUTM');

const formationUrl = 'https://app.evalandgo.com/s/index.php?a=JTk2cCU5N2slOUElQjA=&id=JTk4ayU5QW4lOTYlQUY=';
const connexionUrl = `${frontUrl}/connexion`;
const contactUrl = `${frontUrl}/contact`;
// Redirect from logged to admin doesnt preserve utm
const adminUrl = `${frontUrl}/connexion`;
const adminGuideUrl = `${frontUrl}/connexion`;
const userGuideUrl = `${frontUrl}/connexion`;
const invitationUrl = '';
const idealcoUrl = 'https://www.idealco.fr/campagne/?utm_campaign=g-386-3036d540';

const ADMIN_CAMPAIGN = 'admin-email';
const REQUESTER_CAMPAIGN = 'demandeur-email';
const USER_CAMPAIGN = 'utilisateur-email';
const INVITE_CAMPAIGN = 'invite-email';

const backUrl = 'https://api.preprod.resorption-bidonvilles.beta.gouv.fr';

module.exports = {
    /**
   * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
   * @param {Object} options
   */
    sendAdminNewRequestNotification: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(ADMIN_CAMPAIGN, 'nouvelle-demande-acces');

        return sendMail('admin_new_request_notification', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                frontUrl: `${frontUrl}?${utm}`,
                adminUrl: `${adminUrl}?${utm}`,
                connexionUrl: `${adminUrl}?${utm}`,
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
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(
            ADMIN_CAMPAIGN,
            'nouvelle-demande-acces-3j',
        );

        return sendMail('admin_request_pending_reminder_1', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                frontUrl: `${frontUrl}?${utm}`,
                adminUrl: `${adminUrl}?${utm}`,
                connexionUrl: `${adminUrl}?${utm}`,
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
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(
            ADMIN_CAMPAIGN,
            'nouvelle-demande-acces-10j',
        );

        return sendMail('admin_request_pending_reminder_2', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                frontUrl: `${frontUrl}?${utm}`,
                adminUrl: `${adminUrl}?${utm}`,
                connexionUrl: `${adminUrl}?${utm}`,
                backUrl,
            },
            preserveRecipient,
        });
    },
    /**
   * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
   * @param {Object} options
   */
    sendAdminAccessActivated: (recipient, options = {}) => {
        const { preserveRecipient, variables } = options;

        const utm = generateTrackingUTM(ADMIN_CAMPAIGN, 'acces-active');

        return sendMail('admin_access_activated', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                userName: variables.userName,
                frontUrl: `${frontUrl}?${utm}`,
                connexionUrl: `${adminUrl}?${utm}`,
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
        const { variables, preserveRecipient } = options;

        const utm = generateTrackingUTM(ADMIN_CAMPAIGN, 'acces-expire');

        return sendMail('admin_access_expired', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                userName: variables.userName,
                activationUrlSentDate: variables.activationUrlSentDate,
                frontUrl: `${frontUrl}?${utm}`,
                adminUrl: `${adminUrl}?${utm}`,
                connexionUrl,
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
            'confirmation-demande-acces',
        );

        return sendMail('user_access_request_confirmation', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
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
    sendUserAccessGranted: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;

        const utm = generateTrackingUTM(REQUESTER_CAMPAIGN, 'activer-mon-compte');

        return sendMail('user_access_granted', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                adminName: variables.adminName,
                frontUrl: `${frontUrl}?${utm}`,
                backUrl,
                formationUrl,
                activationUrl: variables.activationUrl,
                activationUrlExpDate: variables.activationUrlExpDate,
            },
            preserveRecipient,
        });
    },

    /**
   * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
   * @param {Object} options
   */
    sendUserAccessDenied: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;

        const utm = generateTrackingUTM(REQUESTER_CAMPAIGN, 'acces-refuse');

        return sendMail('user_access_denied', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                adminName: variables.adminName,
                frontUrl: `${frontUrl}?${utm}`,
                backUrl,
                requestDate: variables.requestDate,
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

        return sendMail('user_access_pending', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                activationUrl: variables.activationUrl,
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
    sendUserAccessExpired: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(
            REQUESTER_CAMPAIGN,
            'acces-expire',
        );

        return sendMail('user_access_expired', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
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
    sendUserAccessActivatedWelcome: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(USER_CAMPAIGN, 'acces-active');

        return sendMail('user_access_activated_welcome', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                userGuideUrl,
                frontUrl: `${frontUrl}?${utm}`,
                backUrl,
                formationUrl,
                connexionUrl,
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

        const utm = generateTrackingUTM(INVITE_CAMPAIGN, 'invitation-plateforme');

        return sendMail('platform_invitation', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                inviterName: variables.inviterName,
                frontUrl: `${frontUrl}?${utm}`,
                backUrl,
                contactUrl,
                formationUrl,
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

        const utm = generateTrackingUTM(INVITE_CAMPAIGN, 'demo-invitation');

        return sendMail('demo_invitation', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
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
    sendUserShantytownActorInvitation: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;

        const utm = generateTrackingUTM(USER_CAMPAIGN, 'invitation-intervenant');

        return sendMail('shantytown_actor_invitation', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                inviterName: variables.inviterName,
                siteUrl: `${frontUrl}/site/${variables.shantytown.id}?${utm}`,
                siteAddress: variables.shantytown.address,
                connexionUrl,
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
    sendUserShantytownActorNotification: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;

        const utm = generateTrackingUTM(USER_CAMPAIGN, 'invitation-intervenant');

        return sendMail('shantytown_actor_notification', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                inviterName: variables.inviterName,
                siteUrl: `${frontUrl}/site/${variables.shantytown.id}?${utm}`,
                siteAddress: variables.shantytown.address,
                connexionUrl,
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
    sendAdminWelcome: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(ADMIN_CAMPAIGN, 'bienvenue');

        return sendMail('admin_welcome', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                connexionUrl,
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
    sendUserIdealcoInvitation: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(INVITE_CAMPAIGN, 'invitation-idealco');

        return sendMail('user_idealco_invitation', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
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
    sendUserFeatures: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(USER_CAMPAIGN, 'features');

        return sendMail('user_features', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                connexionUrl,
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
    sendUserShare: (recipient, options = {}) => {
        const { preserveRecipient } = options;

        const utm = generateTrackingUTM(USER_CAMPAIGN, 'partage-plateforme');

        return sendMail('user_share', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                invitationUrl,
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
        const { variables, preserveRecipient } = options;

        const utm = generateTrackingUTM(USER_CAMPAIGN, 'nouveau-commentaire');

        return sendMail('user_new_comment', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
                shantytown: variables.shantytown,
                comment: variables.comment,
                annuaireUrl: 'todo',
                messageUrl: 'todo',
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

        const utm = generateTrackingUTM(USER_CAMPAIGN, 'nouveau-mot-de-passe');

        return sendMail('user_new_password', {
            recipient,
            variables: {
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
                link: variables.link,
            },
            preserveRecipient,
        });
    },

    /**
   * @param {User} recipient  Recipient of the email (must includes first_name, last_name, email)
   * @param {Object} options
   */
    sendAdminContactMessage: (recipient, options = {}) => {
        const { variables, preserveRecipient } = options;
        const utm = generateTrackingUTM(USER_CAMPAIGN, 'nouveau-mot-de-passe');

        return sendMail('admin_contact_message', {
            recipient,
            variables: {
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
                message: variables.message,
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

        return sendMail('user_comment_deletion', {
            recipient,
            variables: {
                town: variables.town,
                comment: variables.comment,
                message: variables.message,
                backUrl,
                frontUrl: `${frontUrl}?${utm}`,
                recipientName: `${recipient.first_name} ${recipient.last_name}`,
            },
            preserveRecipient,
        });
    },
};
