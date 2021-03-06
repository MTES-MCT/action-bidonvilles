const accessRequestService = require('#server/services/accessRequest/accessRequestService');
const {
    sendUserDemoInvitation,
    sendUserIdealcoInvitation,
    sendUserFeatures,
    sendUserShare,
    sendUserReview,
} = require('#server/mails/mails');

module.exports = (agenda) => {
    agenda.define(
        'access_request_pending_1st',
        (job) => {
            const { userId } = job.attrs.data;
            accessRequestService.handleAccessRequestPending(true, parseInt(userId, 10));
        },
    );

    agenda.define(
        'access_request_pending_2nd',
        (job) => {
            const { userId } = job.attrs.data;
            accessRequestService.handleAccessRequestPending(false, parseInt(userId, 10));
        },
    );

    agenda.define(
        'access_is_pending',
        (job) => {
            const { accessId } = job.attrs.data;
            accessRequestService.handleAccessPending(parseInt(accessId, 10));
        },
    );

    agenda.define(
        'access_is_expired',
        (job) => {
            const { accessId } = job.attrs.data;
            accessRequestService.handleAccessExpired(parseInt(accessId, 10));
        },
    );

    agenda.define(
        'demo_invitation',
        (job) => {
            const { user } = job.attrs.data;
            sendUserDemoInvitation(user);
        },
    );

    agenda.define(
        'idealco_invitation',
        (job) => {
            const { user } = job.attrs.data;
            sendUserIdealcoInvitation(user);
        },
    );

    agenda.define(
        'user_features',
        (job) => {
            const { user } = job.attrs.data;
            sendUserFeatures(user);
        },
    );

    agenda.define(
        'user_share',
        (job) => {
            const { user } = job.attrs.data;
            sendUserShare(user);
        },
    );

    agenda.define(
        'user_review',
        (job) => {
            const { user } = job.attrs.data;
            sendUserReview(user);
        },
    );
};
