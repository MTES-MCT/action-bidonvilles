import NavBar from '#app/layouts/navbar/navbar.vue';
import FilterGroup from './filterGroup/filterGroup.vue';
import Map from './map/map.vue';
import Table from './table/table.vue';
import Quickview from '#app/components/quickview/quickview.vue';
import { all as fetchAll } from '#helpers/townHelper';
import { get as getConfig } from '#helpers/configHelper';

export default {
    components: {
        NavBar,
        FilterGroup,
        Map,
        Table,
        Quickview,
    },
    data() {
        return {
            error: undefined,
            loading: false,
            center: [43.3050621, 0.684586],
            towns: [],
            quickview: {
                town: null,
                originEvent: null,
            },
            filters: [
                {
                    label: 'Types de site',
                    id: 'fieldType',
                    options: [],
                },
                {
                    label: 'Nombre de personnes',
                    id: 'population',
                    options: [
                        { value: null, label: 'Inconnu', checked: true },
                        { value: '-9', label: 'Moins de 10 personnes', checked: true },
                        { value: '10-99', label: 'Entre 10 et 99 personnes', checked: true },
                        { value: '100-', label: '100 personnes et plus', checked: true },
                    ],
                },
                {
                    label: 'Procédure judiciaire en cours',
                    id: 'justice',
                    options: [
                        { value: 'no', label: 'Non', checked: true },
                        { value: 'yes', label: 'Oui', checked: true },
                    ],
                },
                {
                    label: 'Actions en cours',
                    id: 'action',
                    options: [
                        { value: 'no', label: 'Non', checked: true },
                        { value: 'yes', label: 'Oui', checked: true },
                    ],
                },
            ],
            currentTab: 'map',
        };
    },
    computed: {
        visibleTowns() {
            let visibleTowns = this.towns;

            this.filters.forEach((filterGroup) => {
                switch (filterGroup.id) {
                case 'fieldType': {
                    const allowedFieldTypes = filterGroup.options
                        .filter(option => option.checked)
                        .map(option => option.value);

                    visibleTowns = visibleTowns.filter(town => allowedFieldTypes.indexOf(town.field_type_id) !== -1);
                }
                    break;

                case 'population': {
                    const disallowedPopulation = filterGroup.options
                        .filter(option => !option.checked)
                        .map(option => option.value);

                    disallowedPopulation.forEach((value) => {
                        if (value === null) {
                            visibleTowns = visibleTowns.filter(town => town.population_total !== null);
                            return;
                        }

                        let [min, max] = value.split('-');
                        min = parseInt(min, 10);
                        max = parseInt(max, 10);

                        visibleTowns = visibleTowns.filter((town) => {
                            if (!Number.isNaN(min)
                            && !Number.isNaN(max)
                            && town.population_total >= min
                            && town.population_total <= max) {
                                return false;
                            }

                            if (!Number.isNaN(min) && town.population_total >= min) {
                                return false;
                            }

                            if (!Number.isNaN(max) && town.population_total <= max) {
                                return false;
                            }

                            return true;
                        });
                    });
                }
                    break;

                case 'justice': {
                    const disallowedJustice = filterGroup.options
                        .filter(option => !option.checked)
                        .map(option => option.value);

                    disallowedJustice.forEach((value) => {
                        if (value === 'yes') {
                            visibleTowns = visibleTowns.filter(town => town.justice_status === false);
                        } else if (value === 'no') {
                            visibleTowns = visibleTowns.filter(town => town.justice_status === true);
                        }
                    });
                }
                    break;

                case 'action': {
                    const disallowedActions = filterGroup.options
                        .filter(option => !option.checked)
                        .map(option => option.value);

                    disallowedActions.forEach((value) => {
                        if (value === 'yes') {
                            visibleTowns = visibleTowns.filter(town => town.actions.length === 0);
                        } else if (value === 'no') {
                            visibleTowns = visibleTowns.filter(town => town.actions.length > 0);
                        }
                    });
                }
                    break;

                default:
                }
            });

            return visibleTowns;
        },
        currentTabComponent() {
            return this.currentTab === 'map' ? Map : Table;
        },
    },
    created() {
        this.fetchData();
    },
    methods: {
        showQuickview(town, event) {
            this.quickview = {
                town,
                originEvent: event.originalEvent,
            };
        },
        hideQuickview() {
            this.quickview = {
                town: null,
                originEvent: null,
            };
        },
        setTab(name) {
            this.currentTab = name;
        },
        fetchData() {
            if (this.loading === true) {
                return;
            }

            this.loading = true;

            fetchAll()
                .then((towns) => {
                    const { field_types: fieldTypes } = getConfig();

                    this.loading = false;

                    // build the field-type filter
                    const fieldTypeFilter = this.filters.filter(({ id }) => id === 'fieldType')[0];
                    fieldTypeFilter.options = [
                        // special option 'unknown'
                        {
                            id: -1, value: -1, label: 'Inconnu', checked: true,
                        },

                        // options based on field-types returned by the api
                        ...fieldTypes.map(fieldType => ({
                            id: fieldType.id,
                            value: fieldType.id,
                            label: fieldType.name,
                            checked: true,
                        })),
                    ];

                    this.towns = towns;
                })
                .catch((errors) => {
                    this.error = errors.user_message;
                    this.loading = false;
                });
        },
    },
};
