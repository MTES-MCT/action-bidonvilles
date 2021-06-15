import Vue from "vue";
import Vuex from "vuex";
import {
    all as fetchAll,
    get as fetchOne,
    addActor,
    removeActor,
    updateActorThemes,
    removeActorTheme,
    inviteNewActor
} from "#helpers/api/town";
import enrichShantytown from "#app/pages/TownsList/enrichShantytown";
import { get as getConfig } from "#helpers/api/config";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        towns: {
            data: [],
            loading: true,
            error: null,
            sort: "cityName",
            filters: {
                population: [],
                fieldType: [],
                justice: [],
                origin: [],
                conditions: [],
                status: "open",
                location: null,
                actors: [],
                search: ""
            },
            currentPage: 1
        },
        greeter: {
            email: "",
            first_name: "",
            last_name: "",
            organization: {
                organization_id: 0,
                organization_name: ""
            }
        },
        detailedTown: null
    },
    mutations: {
        setLoading(state, value) {
            state.towns.loading = value;
        },
        setTowns(state, towns) {
            state.towns.data = towns;
        },
        setError(state, err) {
            state.towns.error = err;
        },
        setSort(state, sort) {
            state.towns.sort = sort;
        },
        setFilters(state, filters) {
            state.towns.filters = filters;
        },
        setLocation(state, location) {
            state.towns.filters.location = location;
        },
        setCurrentPage(state, page) {
            state.towns.currentPage = page;
        },
        setDetailedTown(state, town) {
            state.detailedTown = town;
        },
        updateShantytownActors(state, { townId, actors }) {
            if (
                state.detailedTown !== null &&
                state.detailedTown.id === townId
            ) {
                state.detailedTown.actors = actors;
            }

            const town = state.towns.data.find(({ id }) => id === townId);
            if (town !== undefined) {
                town.actors = actors;
            }
        },
        updateShantytownActorThemes(state, { townId, userId, themes }) {
            if (
                state.detailedTown !== null &&
                state.detailedTown.id === townId
            ) {
                const actor = state.detailedTown.actors.find(
                    ({ id }) => id === userId
                );
                if (actor !== undefined) {
                    actor.themes = themes;
                }
            }

            const town = state.towns.data.find(({ id }) => id === townId);
            if (town !== undefined) {
                const actor = town.actors.find(({ id }) => id === userId);
                if (actor !== undefined) {
                    actor.themes = themes;
                }
            }
        },
        saveGreeter(currentState, greeter) {
            currentState.greeter = {
                ...greeter
            };
        },
        saveHost(currentState, host) {
            let index = currentState.hosts.findIndex(
                h => h.email == host.email
            );
            if (index == -1) {
                currentState.hosts.push(host);
            } else {
                Vue.set(currentState.hosts, index, host);
            }
        }
    },
    actions: {
        async fetchTowns({ commit }) {
            commit("setLoading", true);
            try {
                const { user, field_types: fieldTypes } = getConfig();

                if (
                    user.organization.location.type !== "nation" &&
                    user.role_id !== "national_admin"
                ) {
                    commit("setLocation", {
                        id:
                            user.organization.location[
                                user.organization.location.type
                            ].code,
                        label:
                            user.organization.location[
                                user.organization.location.type
                            ].name,
                        category: user.organization.location.type,
                        locationType: user.organization.location.type,
                        code:
                            user.organization.location[
                                user.organization.location.type
                            ].code,
                        data: {
                            code:
                                user.organization.location[
                                    user.organization.location.type
                                ].code,
                            type: user.organization.location.type
                        }
                    });
                }

                const originalTowns = await fetchAll();
                const towns = originalTowns.map(s =>
                    enrichShantytown(s, fieldTypes)
                );
                commit("setTowns", towns);
                commit("setLoading", false);
            } catch (err) {
                commit("setError", err);
                commit("setLoading", false);
            }
        },

        async fetchTownDetails({ commit }, id) {
            const { field_types: fieldTypes } = getConfig();
            const town = enrichShantytown(await fetchOne(id), fieldTypes);
            commit("setDetailedTown", town);
        },

        async addTownActor({ commit }, { townId, actor }) {
            const { actors } = await addActor(townId, actor);
            commit("updateShantytownActors", { townId, actors });
        },

        async removeTownActor({ commit }, { townId, userId }) {
            const { actors } = await removeActor(townId, userId);
            commit("updateShantytownActors", { townId, actors });
        },

        async updateTownActorThemes({ commit }, { townId, userId, themes }) {
            const { themes: updatedThemes } = await updateActorThemes(
                townId,
                userId,
                themes
            );
            commit("updateShantytownActorThemes", {
                townId,
                userId,
                themes: updatedThemes
            });
        },

        async removeTownActorTheme({ commit }, { townId, userId, themeId }) {
            const { themes } = await removeActorTheme(townId, userId, themeId);
            commit("updateShantytownActorThemes", { townId, userId, themes });
        },

        inviteNewTownActor(args, { townId, email }) {
            return inviteNewActor(townId, email);
        }
    },
    getters: {
        towns: state => {
            return state.towns.data;
        },
        detailedTown: state => {
            return state.detailedTown;
        },
        townsLoading: state => {
            return state.towns.loading;
        },
        townsError: state => {
            return state.towns.error;
        },
        townsFilters: state => {
            return state.towns.filters;
        },
        townsSort: state => {
            return state.towns.sort;
        },
        townsCurrentPage: state => {
            return state.towns.currentPage;
        }
    }
});