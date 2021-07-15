function buildClause(defaultTable, index, key, definition) {
    // parse
    const column = (definition && definition.query) || `${defaultTable}.${key}`;
    const not = (definition && definition.not) === true;
    const replacementKey = `${key}${index}`;
    const operator = (definition && definition.operator) || 'IN';

    let replacementValue = definition;
    if (definition && Object.prototype.hasOwnProperty.call(definition, 'value')) {
        replacementValue = definition.value;
    }

    // build
    return {
        statement: `(${column} ${not ? 'NOT' : ''} ${operator} (:${replacementKey}))`,
        replacement: {
            [replacementKey]: replacementValue,
        },
    };
}


function buildClauseGroup(defaultTable, index, group) {
    const statement = [];
    const replacement = {};

    Object.keys(group).forEach((key) => {
        const {
            statement: subStatement,
            replacement: subReplacement,
        } = buildClause(defaultTable, index, key, group[key]);

        statement.push(subStatement);
        Object.assign(replacement, subReplacement);
    });

    return {
        statement: `(${statement.join(' OR ')})`,
        replacement,
    };
}

/**
 * Example of valid input:
 * [
 *      {
 *          population_total: 10,
 *          trash_evacuation: { value: false },
 *      },
 *      {
 *          departement: { value: '78', query: 'departements.code' },
 *          status: { not: true, value: ['open', 'unknown'] },
 *      },
 *      {
 *          name: { operator: 'ILIKE', value: '%a%' }
 *      }
 *  ]
 *
 *  Which should translate into:
 *  (population_total IN (10) OR trash_evacuation IN (false))
 *  AND
 *  (departements.code IN ('78') OR status NOT IN ('open', 'unknown'))
 *  AND
 *  (name ILIKE ('%a%'))
 */
module.exports = {
    buildWhere(defaultTable, clauseGroups) {
        return clauseGroups.reduce((acc, group, index) => {
            const {
                statement: subStatement,
                replacement: subReplacement,
            } = buildClauseGroup(defaultTable, index, group);

            return {
                statement: [...acc.statement, subStatement],
                replacement: { ...acc.replacement, ...subReplacement },
            };
        }, {
            statement: [],
            replacement: {},
        });
    },
};
