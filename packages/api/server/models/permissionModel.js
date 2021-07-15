/**
 * @typedef {Object} PermissionOwners
 * @property {Array.<Number>} [organization] List of organization ids
 * @property {Array.<Number>} [role_admin]   List of admin role ids
 * @property {Array.<Number>} [role_regular] List of regular role ids
 */

/**
 * @typedef {Object} PermissionMap
 * @property {Object.<Number,Permissions>} organizations Permissions grouped by organization id
 * @property {Object.<Number,Permissions>} roles_admin   Permissions grouped by admin role ids
 * @property {Object.<Number,Permissions>} roles_regular Permissions grouped by regular role ids
 */

/**
 * @typedef {Object.<String,Permission>} Permissions Permissions grouped by feature name
 */

/**
 * This object might have data_* properties, depending on the entity
 * In ideal case, I should document it, but I'm currently missing time, and
 * you might find the proper information from the UML schema of the database.
 *
 * @typedef {Object} Permission
 * @property {Boolean} allowed
 * @property {String}  geographic_level
 */

module.exports = (database) => {
    /**
     * List of entities
     *
     * @type {Array.<String>|Null}
     */
    let entities = null;

    /**
     * Fetches the list of entities registered into database
     *
     * @returns {Array.<String>}
     */
    async function fetchEntities() {
        const rows = await database.query('SELECT name FROM entities', {
            type: database.QueryTypes.SELECT,
        });

        entities = rows.map(({ name }) => name);
        return entities;
    }

    /**
     * Queries permissions for a specific entity from the database
     *
     * @param {String}           entity Entity name
     * @param {PermissionOwners} owners
     *
     * @returns {Array}
     */
    function subquery(entity, owners) {
        const where = [];
        const replacements = {};
        Object.keys(owners).forEach((ownerType) => {
            if (owners[ownerType].length > 0) {
                replacements[ownerType] = owners[ownerType];
                where.push(`permissions.fk_${ownerType} IN (:${ownerType})`);
            }
        });

        return database.query(`
            SELECT
                permissions.fk_organization AS organization,
                permissions.fk_role_admin AS role_admin,
                permissions.fk_role_regular AS role_regular,
                permissions.fk_entity AS entity,
                permissions.fk_feature AS feature,
                permissions.allowed,
                permissions.fk_geographic_level AS geographic_level,
                features.write,
                ${entity}_permissions.*
            FROM ${entity}_permissions
            LEFT JOIN permissions ON ${entity}_permissions.fk_permission = permissions.permission_id
            LEFT JOIN features ON permissions.fk_feature = features.name AND permissions.fk_entity = features.fk_entity
            ${where.length > 0 ? `WHERE ${where.join(' OR ')}` : ''}
            ORDER BY role_admin ASC, role_regular ASC, organization ASC, feature ASC
        `, {
            type: database.QueryTypes.SELECT,
            replacements,
        });
    }

    /**
     * Processes and merges the given rows into the given permission map
     *
     * @param {PermissionMap} argPermissions
     * @param {Array}         rows
     *
     * @returns {PermissionMap}
     */
    function merge(argPermissions, rows) {
        const permissions = Object.assign({}, argPermissions);

        rows.forEach((row) => {
            // build the permission object
            const permission = {
                allowed: row.allowed,
                geographic_level: row.geographic_level,
                write: row.write,
            };

            Object.keys(row).filter(key => key.substr(0, 5) === 'data_').forEach((key) => {
                permission[key] = row[key];
            });

            // merge it to the permissions object
            let ownerId;
            let ownerType;
            if (row.organization !== null) {
                ownerId = row.organization;
                ownerType = 'organizations';
            } else if (row.role_admin !== null) {
                ownerId = row.role_admin;
                ownerType = 'roles_admin';
            } else if (row.role_regular !== null) {
                ownerId = row.role_regular;
                ownerType = 'roles_regular';
            }

            if (!Object.prototype.hasOwnProperty.call(permissions[ownerType], ownerId)) {
                permissions[ownerType][ownerId] = {};
            }

            if (!Object.prototype.hasOwnProperty.call(permissions[ownerType][ownerId], row.entity)) {
                permissions[ownerType][ownerId][row.entity] = {};
            }

            // if (Object.prototype.hasOwnProperty.call(permissions[ownerType][ownerId][row.entity], row.feature)) {
            // @TODO: we should throw an exception here
            // }

            permissions[ownerType][ownerId][row.entity][row.feature] = permission;
        });

        return permissions;
    }

    /**
     * Queries permissions from the database
     *
     * @param {PermissionOwners} [owners]
     *
     * @returns {PermissionMap}
     */
    async function query(owners = {}) {
        if (entities === null) {
            await fetchEntities();
        }

        let permissions = {
            organizations: {},
            roles_admin: {},
            roles_regular: {},
        };

        for (let i = 0; i < entities.length; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            permissions = merge(permissions, await subquery(entities[i], owners));
        }

        return permissions;
    }

    return {
        /**
         * Returns a full permission map
         *
         * @returns {PermissionMap}
         */
        findAll: () => query(),

        /**
         * Returns a permission map for the requested owners only
         *
         * @param {PermissionOwners} owners
         *
         * @returns {PermissionMap}
         */
        find: owners => query(owners),
    };
};
