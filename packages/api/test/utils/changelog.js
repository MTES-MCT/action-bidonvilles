const merge = require('deepmerge');

module.exports = {
    raw(override = {}) {
        const defaultObj = {
            app_version: '0.0.0',
            date: '2020-01-01',
            title: 'Titre',
            description: '<p>Description <strong>importante</strong></p>',
            image: 'https://api.resorption-bidonvilles.localhost/assets/changelog/0.0.0/item_1.jpg',
        };

        return merge(defaultObj, override);
    },
};
