<template>
    <div>
        <div>
            <div data-cy-data="city">
                {{ town.city.name }} ({{ town.departement.name }})
            </div>
            <div class="text-display-lg" data-cy-data="address">
                {{ town.addressSimple }}
                <span v-if="town.name" class="text-display-xs"
                    >« {{ town.name }} »</span
                >
            </div>
        </div>
        <div class="flex items-center">
            <div
                v-if="this.closedOrSolved"
                class="flex items-center uppercase text-sm mr-4"
            >
                <div v-if="this.isClosed">
                    Fermé le
                    {{ formatDate(town.closedAt, "d/m/y") }}
                </div>
                <div v-else-if="this.isSolved">
                    Résorbé le
                    {{ formatDate(town.closedAt, "d/m/y") }}
                </div>
            </div>
            <div class="flex items-center uppercase text-sm mr-4">
                <div class="rounded-full bg-corail h-3 w-3 mr-2 " />
                Mis à jour le
                {{ formatDate(town.updatedAt, "d/m/y") }}
            </div>
            <div
                class="flex items-center text-red uppercase text-xs font-bold cursor-pointer"
                @click="$emit('openCovid')"
            >
                <Icon icon="comment" class="mr-2" />
                <div>
                    {{ this.town.comments.covid.length || 0 }} commentaires
                    covid
                </div>
            </div>
        </div>
        <div class="flex justify-end mt-2">
            <Button
                v-if="
                    hasLocalizedPermission('shantytown.close') &&
                        town.status === 'open'
                "
                variant="primaryOutline"
                class="mr-8"
                iconPosition="left"
                @click="$emit('openCancel')"
                >Fermer le site</Button
            >
            <Button
                variant="primary"
                class="mr-8"
                icon="pen"
                iconPosition="left"
                v-if="
                    hasLocalizedPermission('shantytown.update') &&
                        town.status === 'open'
                "
                @click="routeToUpdate"
                >Mettre à jour</Button
            >
            <router-link
                to="#newComment"
                @click.native="scrollFix('#newComment')"
                v-if="
                    hasLocalizedPermission('shantytown_comment.list') ||
                        hasLocalizedPermission('shantytown_comment.create')
                "
            >
                <Button variant="secondary" icon="comment" iconPosition="left"
                    >Journal du site</Button
                >
            </router-link>
            <Button
                v-if="hasLocalizedPermission('shantytown.delete')"
                class="ml-8"
                variant="secondary"
                icon="trash-alt"
                iconPosition="left"
                @click="$emit('deleteTown')"
                data-cy-button="delete"
                >Supprimer le site</Button
            >
        </div>
    </div>
</template>

<script>
import { get as getConfig, getPermission } from "#helpers/api/config";

export default {
    props: {
        town: {
            type: Object
        }
    },
    data() {
        const { user } = getConfig();
        return {
            user
        };
    },
    methods: {
        hasLocalizedPermission(permissionName) {
            const permission = getPermission(permissionName);
            if (permission === null) {
                return false;
            }

            let level =
                permission.geographic_level !== "local"
                    ? permission.geographic_level
                    : this.user.organization.location.type;

            if (
                !permission.write &&
                permission.geographic_level === "local" &&
                ["epci", "city"].includes(this.user.organization.location.type)
            ) {
                level = "departement";
            }

            if (level === "nation") {
                return true;
            } else if (this.user.organization.location[level] === null) {
                return false;
            }

            return (
                this.town[level].code ===
                this.user.organization.location[level].code
            );
        },
        // Force scroll even if hash is already present in url
        scrollFix(to) {
            if (to === this.$route.hash) {
                const el = document.getElementById(to.slice(1));
                if (el) {
                    window.scrollTo(0, el.offsetTop);
                }
            }
        },
        /**
         * @see index.js
         */
        formatDate(...args) {
            return window.App.formatDate.apply(window, args);
        },
        routeToUpdate() {
            this.$router.push(`/site/${this.town.id}/mise-a-jour`);
        }
    },
    computed: {
        isClosed() {
            return (
                this.town.closedAt && this.town.closedWithSolutions !== "yes"
            );
        },
        isSolved() {
            return (
                this.town.closedAt && this.town.closedWithSolutions === "yes"
            );
        },
        closedOrSolved() {
            return this.isClosed || this.isSolved;
        }
    }
};
</script>
