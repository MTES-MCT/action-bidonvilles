<template>
    <PublicLayout
        :stickyHeader="false"
        :displayLanguagePicker="false"
        class="invitation"
    >
        <div class="bg-corail full-width text-center py-8">
            <div class="mx-6 max-w-3xl md:mx-auto">
                <h1
                    class="text-display-md
                           text-white 
                           md:text-white 
                           md:text-display-lg"
                >
                    {{ $t("invitationPage.title") }}
                </h1>
            </div>
        </div>
        <PublicContainer class="py-4">
            <div class="max-w-xl mx-auto">
                <div class="mx-auto pb-8">
                    <div class="mt-8">
                        <span class="font-bold">{{
                            $t("invitationPage.firstParagraph.bold")
                        }}</span>
                        {{ $t("invitationPage.firstParagraph.normal") }}<br />
                        <span class="italic">{{
                            $t("invitationPage.secondParagraph.normal")
                        }}</span>
                    </div>
                </div>
            </div>
            <InvitationForm
                v-on:addGuestReq="addGuestToList($event)"
            ></InvitationForm>
            <div
                v-if="this.guestList.length > 0"
                class="text-display-md text-primary md:mb-8"
            >
                Personne{{ this.guestList.length > 1 ? "s" : "" }} invitée{{
                    this.guestList.length > 1 ? "s" : ""
                }}
            </div>
            <InvitationCardStack
                v-bind:guestList="guestList"
                @delete-guest="deleteGuest"
            ></InvitationCardStack>
            <div
                v-if="error !== null"
                class="bg-red200 justify-items-center md:mt-2 p-3 mb-8"
            >
                <strong>{{ error }}</strong>

                <ul
                    class="ml-4 list-disc"
                    v-if="Object.keys(errors).length > 0"
                >
                    <li
                        v-for="(error, inputId) in errors"
                        :key="inputId"
                        class="mt-4"
                    >
                        {{ error.label }} :
                        <ul>
                            <li
                                v-for="(message, messageId) in error.messages"
                                :key="messageId"
                            >
                                - {{ message }}
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>

            <div class="flex justify-end space-x-8 mt-8 mb-8">
                <Button variant="primaryText" v-if="!loading" @click="omit">
                    {{ $t("invitationPage.cancel") }}
                </Button>
                <Button
                    variant="primary"
                    :loading="loading"
                    v-if="this.guestList.length > 0"
                    @click="sendInvitations"
                    >{{ $t("invitationPage.invite") }}
                </Button>
            </div>
        </PublicContainer>
    </PublicLayout>
</template>

<script>
import { invite } from "#helpers/api/invite";
import { notify } from "#helpers/notificationHelper";
import PublicLayout from "#app/components/PublicLayout/index.vue";
import PublicContainer from "#app/components/PublicLayout/PublicContainer.vue";
import InvitationForm from "./InvitationForm.vue";
import InvitationCardStack from "./InvitationCardStack";

export default {
    components: {
        PublicContainer,
        PublicLayout,
        InvitationForm,
        InvitationCardStack
    },
    data() {
        return {
            guestList: [],
            loading: false,
            error: null,
            fieldErrors: {}
        };
    },
    computed: {
        greeter() {
            return {
                email: this.$route.query.email,
                first_name: this.$route.query.first_name,
                last_name: this.$route.query.last_name
            };
        },
        inviteFrom() {
            return this.$route.query.from;
        },
        errors() {
            const labels = {
                greeter:
                    "Courriel de l'utilisateur à l'origine de l'invitation",
                guests: "Liste des invité(e)s",
                email: "Courriel",
                first_name: "Prénom",
                last_name: "Nom de famille"
            };

            function getLabel(key) {
                if (labels[key] !== undefined) {
                    return labels[key];
                }

                const match = key.match(/^guests\[([0-9]+)\]\.(.+)$/i);
                if (match === null) {
                    return "Champ inconnu";
                }

                return `${getLabel(match[2])} de l'invité(e) n°${parseInt(
                    match[1],
                    10
                ) + 1}`;
            }

            return Object.keys(this.fieldErrors).reduce((acc, key) => {
                return {
                    ...acc,
                    [key]: {
                        label: getLabel(key),
                        messages: this.fieldErrors[key]
                    }
                };
            }, {});
        }
    },
    methods: {
        backHomeWithErrMsg(msg) {
            this.$router.push("/");
            notify({
                group: "notifications",
                type: "error",
                title: "Erreur",
                text: msg
            });
        },
        async sendInvitations() {
            if (this.loading !== false) {
                return;
            }

            // Préparation de l'objet data à transmettre à l'API
            const data = {
                // Ajout des destinataires au message de confirmation
                guests: this.guestList.map(
                    ({ email, first_name, last_name }) => ({
                        email,
                        first_name,
                        last_name
                    })
                ),
                greeter: this.greeter,
                invite_from: this.inviteFrom
            };

            // Préparation du message de confirmation d'envoi des mails
            const msg = [
                "Invitation(s) envoyée(s) à",
                ...this.guestList.map(({ email }) => email)
            ].join("<br/>");

            this.loading = true;
            this.error = null;
            this.fieldErrors = {};

            try {
                await invite(data);
                this.loading = false;
                this.$router.push("/");
                notify({
                    group: "notifications",
                    type: "success",
                    title: "Succès",
                    text: msg
                });
            } catch (err) {
                this.loading = false;

                this.error =
                    "Une erreur est survenue lors de l'envoi des invitations.";
                if (err && err.user_message) {
                    this.error = err.user_message;
                    this.fieldErrors = err.fields || {};
                }
            }
        },
        omit() {
            this.loading = false;
            this.$router.push("/");
            notify({
                group: "notifications",
                type: "success",
                title: "Merci !",
                text: "A bientôt."
            });
        },
        addGuestToList(guest) {
            this.guestList.push({
                first_name: guest.first_name,
                last_name: guest.last_name,
                email: guest.email
            });
        },
        deleteGuest(index) {
            this.guestList.splice(index, 1);
        }
    },
    created() {
        if (!this.greeter) {
            this.backHomeWithErrMsg(
                "Impossible d'identifier l'utilisateur' à l'origine de l'invitation"
            );
        }
    }
};
</script>

<style lang="scss">
.contact {
    .autocompleter-textfield input:focus {
        @apply border-primary;
    }
}
</style>
