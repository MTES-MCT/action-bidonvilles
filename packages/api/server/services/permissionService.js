module.exports = {

    can: user => ({
        do: (feature, entity) => ({
            on(location, plan = null) {
                // on vérifie que l'utilisateur dispose de la permission demandée
                if (!user || !user.permissions || !user.permissions[entity]) {
                    return false;
                }

                const permission = user.permissions[entity][feature];
                if (!permission || permission.allowed !== true) {
                    return false;
                }

                if (permission.geographic_level === 'nation') {
                    return true;
                }

                // on interprète la valeur spéciale "own", dédiée exclusivement aux permissions plan.update et plan.updateMarks
                if (permission.geographic_level === 'own') {
                    if (!plan) {
                        throw new Error('Le dispositif est obligatoire pour une permission de type `own`');
                    }

                    if (feature === 'update') {
                        if (!plan.government_contacts) {
                            return false;
                        }

                        return plan.government_contacts.some(({ id }) => id === user.id);
                    }

                    if (feature === 'updateMarks') {
                        if (!plan.operator_contacts) {
                            return false;
                        }

                        return plan.operator_contacts.some(contact => contact.organization.id === user.organization.id);
                    }

                    // pour toute autre feature que "update" et "updateMarks", il suffit que
                    // l'utilisateur soit soit pilote, soit opérateur
                    if (plan.government_contacts && plan.government_contacts.some(({ id }) => id === user.id)) {
                        return true;
                    }

                    if (plan.operator_contacts && plan.operator_contacts.some(contact => contact.organization.id === user.organization.id)) {
                        return true;
                    }

                    return false;
                }

                // on détermine le niveau géographique de la permission
                // (notamment, on traduit la valeur spéciale "local" en un niveau géographique spécifique)
                let permissionLevel;
                if (permission.geographic_level === 'local') {
                    switch (user.organization.location.type) {
                        case 'nation':
                            return true;

                        case 'region':
                            permissionLevel = 'region';
                            break;

                        // pour tout utilisateur en-dessous du niveau régional :
                        // une permission "local" se traduit :
                        // - pour de l'écriture en permission "locale"
                        // - pour de la lecture en permission "départementale"
                        default:
                            if (permission.write) {
                                permissionLevel = user.organization.location.type;
                            } else {
                                permissionLevel = 'departement';
                            }
                    }
                } else {
                    permissionLevel = user.permissions.shantytown.export.geographic_level;
                }

                // on vérifie que l'utilisateur a bien le bon niveau géographique pour avoir la permission
                if (!location[permissionLevel] || !user.organization.location[permissionLevel]) {
                    return false;
                }

                const codes = [location[permissionLevel].code];
                if (permissionLevel === 'city' && location[permissionLevel].main) {
                    codes.push(location[permissionLevel].main);
                }

                return codes.includes(user.organization.location[permissionLevel].code);
            },
        }),
    }),

    where: () => ({
        can: user => ({
            do(feature, entity) {
                // on vérifie que l'utilisateur dispose de la permission demandée
                if (!user || !user.permissions || !user.permissions[entity]) {
                    throw new Error(`L'utilisateur ne dispose pas de la permission ${entity}.${feature}`);
                }

                const permission = user.permissions[entity][feature];
                if (!permission || permission.allowed !== true) {
                    throw new Error(`L'utilisateur ne dispose pas de la permission ${entity}.${feature}`);
                }

                // on détermine quel est le niveau géographique de la permission (on traduit notamment "local" en un niveau géographique concret)
                let permissionLevel = permission.geographic_level;
                if (permissionLevel === 'local') {
                    switch (user.organization.location.type) {
                        case 'nation':
                        case 'region':
                            permissionLevel = user.organization.location.type;
                            break;

                        // pour tout utilisateur en-dessous du niveau régional
                        // une permission "local" se traduit en :
                        // - permission "locale" pour une permission d'écriture
                        // - permission "départementale" pour une permission de lecture
                        default:
                            if (permission.write) {
                                permissionLevel = user.organization.location.type;
                            } else {
                                permissionLevel = 'departement';
                            }
                    }
                }

                switch (permissionLevel) {
                    case 'nation':
                        return null;

                    case 'region':
                        if (!user.organization.location.region) {
                            throw new Error('Impossible d\'accorder une permission régionale à un utilisateur national');
                        }

                        return {
                            statement: 'regions.code IN (:where_region)',
                            replacements: {
                                where_region: [user.organization.location.region.code],
                            },
                        };

                    case 'departement':
                        if (!user.organization.location.departement) {
                            throw new Error('Impossible d\'accorder une permission départementale à un utilisateur non rattaché à un département');
                        }

                        return {
                            statement: 'departements.code IN (:where_departement)',
                            replacements: {
                                where_departement: [user.organization.location.departement.code],
                            },
                        };

                    case 'epci':
                        if (!user.organization.location.epci) {
                            throw new Error('Impossible d\'accorder une permission intercommunale à un utilisateur non rattaché à une epci');
                        }

                        if (entity === 'plan') {
                            throw new Error('Impossible d\'accorder une permission de niveau `epci` à l\'entité `plan`');
                        }

                        return {
                            statement: 'epci.code IN (:where_epci)',
                            replacements: {
                                where_epci: [user.organization.location.epci.code],
                            },
                        };

                    case 'city':
                        if (!user.organization.location.city) {
                            throw new Error('Impossible d\'accorder une permission communale à un utilisateur non rattaché à une commune');
                        }

                        if (entity === 'plan') {
                            throw new Error('Impossible d\'accorder une permission de niveau `city` à l\'entité `plan`');
                        }

                        return {
                            statement: 'cities.code IN (:where_city) OR cities.fk_main IN (:where_city)',
                            replacements: {
                                where_city: [user.organization.location.city.code],
                            },
                        };

                    case 'own':
                        if (entity !== 'plan') {
                            throw new Error(`Impossible d'accorder une permission de niveau \`own\` à l'entité \`${entity}\``);
                        }

                        return {
                            statement: '(plan_managers && ARRAY[:where_managers]) OR (plan_operators && ARRAY[:where_managers])',
                            replacements: {
                                where_managers: [user.id],
                            },
                        };

                    default:
                        throw new Error('Niveau de permission inconnu');
                }
            },
        }),
    }),

};
