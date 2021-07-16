<template>
    <PublicLayout
        :stickyHeader="false"
        :displayLanguagePicker="true"
        class="contact"
    >
        <div class="bg-corail full-width text-center py-8">
            <div class="max-w-3xl mx-auto">
                <h1 class="text-display-lg  text-white ">
                    {{ $t("contactPage.title") }}
                </h1>
            </div>
        </div>
        <PublicContainer class="py-16">
            <div class="max-w-xl mx-auto">
                <h2 class="text-display-lg mb-4">
                    {{ $t("contactPage.contactUs") }}
                </h2>
                <ValidationObserver
                    ref="form"
                    v-slot="{ handleSubmit, errors }"
                >
                    <form
                        class="max-w-xl mt-12"
                        @submit.prevent="handleSubmit(submitForm)"
                    >
                        <InputGroup>
                            <TextInput
                                :showMandatoryStar="true"
                                :label="$t('contactPage.email')"
                                v-model="commonFields.email"
                                id="email"
                                validationName="Email"
                                rules="required|email"
                            />
                            <TextInput
                                :showMandatoryStar="true"
                                :label="$t('contactPage.firstname')"
                                v-model="commonFields.first_name"
                                id="first_name"
                                name="Prénom"
                                rules="required"
                            />
                            <TextInput
                                :showMandatoryStar="true"
                                :label="$t('contactPage.lastname')"
                                v-model="commonFields.last_name"
                                id="last_name"
                                name="Nom de famille"
                                rules="required"
                            />
                            <TextInput
                                :showMandatoryStar="true"
                                :rows="8"
                                :label="$t('contactPage.phone')"
                                v-model="commonFields.phone"
                                id="phone"
                                rules="required"
                            />
                        </InputGroup>
                        <CheckableGroup
                            :label="$t('contactPage.requestType')"
                            :name="$t('contactPage.requestType')"
                            id="request_type"
                            direction="row"
                        >
                            <Checkbox
                                checkValue="help"
                                :label="$t('contactPage.help')"
                                v-model="commonFields.request_type"
                                variant="card"
                            />
                            <Checkbox
                                checkValue="report"
                                :label="$t('contactPage.report')"
                                v-model="commonFields.request_type"
                                variant="card"
                            />
                            <Checkbox
                                checkValue="help-request"
                                :label="$t('contactPage.requestHelp')"
                                v-model="commonFields.request_type"
                                variant="card"
                            />
                            <Checkbox
                                checkValue="info-request"
                                :label="$t('contactPage.requestInfo')"
                                v-model="commonFields.request_type"
                                variant="card"
                            />
                            <Checkbox
                                checkValue="access-request"
                                :label="$t('contactPage.requestAccess')"
                                v-model="commonFields.request_type"
                                variant="card"
                            />
                        </CheckableGroup>
                        <CheckableGroup
                            v-if="isRequestAccess"
                            :label="$t('contactPage.isActor')"
                            :info="$t('contactPage.actorExample')"
                            rules="required"
                            id="access_request"
                            direction="row"
                        >
                            <Radio
                                :checkValue="true"
                                :label="$t('contactPage.yes')"
                                v-model="commonFields.is_actor"
                                variant="card"
                            />
                            <Radio
                                :checkValue="false"
                                :label="$t('contactPage.no')"
                                v-model="commonFields.is_actor"
                                variant="card"
                            />
                        </CheckableGroup>
                        <CheckableGroup
                            v-if="isRequestAccessAndActor"
                            :label="$t('contactPage.whichEstablishment')"
                            rules="required"
                            id="is_actor"
                        >
                            <Radio
                                v-model="
                                    requestAccessFields.organization_category
                                "
                                checkValue="public_establishment"
                                :label="$t('contactPage.public')"
                                variant="card"
                            />
                            <Radio
                                v-model="
                                    requestAccessFields.organization_category
                                "
                                checkValue="territorial_collectivity"
                                :label="
                                    $t('contactPage.territorialCollectivity')
                                "
                                variant="card"
                            />
                            <Radio
                                v-model="
                                    requestAccessFields.organization_category
                                "
                                checkValue="association"
                                :label="$t('contactPage.association')"
                                variant="card"
                            />
                            <Radio
                                v-model="
                                    requestAccessFields.organization_category
                                "
                                checkValue="administration"
                                :label="$t('contactPage.administration')"
                                variant="card"
                            />
                        </CheckableGroup>

                        <PublicEstablishmentForm
                            v-if="isPublicEstablishmentRequest"
                            :organizationType.sync="
                                publicEstablishmentFields.organization_type
                            "
                            :organizationTerritory.sync="
                                publicEstablishmentFields.organization_public
                            "
                            :organizationFunction.sync="
                                requestAccessFields.position
                            "
                        />
                        <TerritorialCollectivityForm
                            v-if="isTerritorialCollectivityRequest"
                            :collectivityName.sync="
                                territorialCollectivityFields.territorial_collectivity
                            "
                            :collectivityFunction.sync="
                                requestAccessFields.position
                            "
                        />
                        <AssociationForm
                            v-if="isAssociationRequest"
                            :associationName.sync="
                                associationFields.association
                            "
                            :associationTerritory.sync="
                                associationFields.departement
                            "
                            :associationFunction.sync="
                                associationFields.position
                            "
                            :newAssociationName.sync="
                                associationFields.new_association_name
                            "
                            :newAssociationAcronym.sync="
                                associationFields.new_association_abbreviation
                            "
                        />
                        <AdministrationForm
                            v-if="isAdministrationRequest"
                            :administrationName.sync="
                                administrationFields.organization_administration
                            "
                            :administrationFunction.sync="
                                requestAccessFields.position
                            "
                        />
                        <TextArea
                            :rows="8"
                            :label="$t('contactPage.message')"
                            v-model="commonFields.access_request_message"
                            id="access_request_message"
                        />

                        <CheckableGroup
                            v-if="isFrenchLocale"
                            :label="$t('contactPage.referral.question')"
                            id="referral"
                        >
                            <Radio
                                v-model="commonFields.referral"
                                checkValue="dihal_event"
                                :label="$t('contactPage.referral.dihalEvent')"
                                variant="card"
                            />
                            <Radio
                                v-model="commonFields.referral"
                                checkValue="newsletter"
                                :label="$t('contactPage.referral.newsletter')"
                                variant="card"
                            />
                            <Radio
                                v-model="commonFields.referral"
                                checkValue="social_network"
                                :label="
                                    $t('contactPage.referral.socialNetwork')
                                "
                                variant="card"
                            />
                            <Radio
                                v-model="commonFields.referral"
                                checkValue="word_of_mouth"
                                :label="$t('contactPage.referral.wordOfMouth')"
                                variant="card"
                            />
                            <Radio
                                v-model="commonFields.referral"
                                checkValue="online_search"
                                :label="$t('contactPage.referral.onlineSearch')"
                                variant="card"
                            />
                            <Radio
                                v-model="commonFields.referral"
                                checkValue="other"
                                :label="$t('contactPage.referral.other')"
                                variant="card"
                            />
                        </CheckableGroup>

                        <TextInput
                            id="referral_other"
                            v-model="commonFields.referral_other"
                            v-if="commonFields.referral === 'other'"
                            :label="$t('contactPage.referral.otherQuestion')"
                        />

                        <TextInput
                            id="referral_word_of_mouth"
                            v-model="commonFields.referral_word_of_mouth"
                            v-if="commonFields.referral === 'word_of_mouth'"
                            :label="
                                $t('contactPage.referral.wordOfMouthQuestion')
                            "
                        />

                        <CheckableGroup
                            validationName="Accord"
                            rules="required"
                            id="legal"
                        >
                            <Checkbox
                                checkValue="confirm"
                                :label="$t('contactPage.legal')"
                                v-model="commonFields.legal"
                            />
                        </CheckableGroup>

                        <div
                            v-if="
                                Object.values(errors).filter(err => err.length)
                                    .length
                            "
                            class="bg-red200 p-3 mb-8"
                        >
                            {{ $t("contactPage.error") }}

                            <ul class="mt-4">
                                <li
                                    v-for="(error, inputId) in errors"
                                    :key="inputId"
                                    v-show="error.length"
                                >
                                    <router-link
                                        class="link"
                                        :to="{ hash: inputId }"
                                        >{{ error[0] }}</router-link
                                    >
                                </li>
                            </ul>
                        </div>

                        <div class="flex justify-between mt-8">
                            <router-link to="/"
                                ><Button variant="primaryText">{{
                                    $t("contactPage.cancel")
                                }}</Button></router-link
                            >
                            <Button
                                type="submit"
                                variant="primary"
                                :loading="loading"
                                >{{ $t("contactPage.send") }}</Button
                            >
                        </div>
                    </form>
                </ValidationObserver>
                <div class="text-display-md mt-32 mb-2">
                    {{ $t("contactPage.share") }}
                </div>
                <SocialShare class="mb-8" />
            </div>
        </PublicContainer>
    </PublicLayout>
</template>

<script>
import { contact } from "#helpers/api/contact";
import { notify } from "#helpers/notificationHelper";
import PublicLayout from "#app/components/PublicLayout/index.vue";
import PublicContainer from "#app/components/PublicLayout/PublicContainer.vue";
import PublicEstablishmentForm from "./PublicEstablishmentForm.vue";
import TerritorialCollectivityForm from "./TerritorialCollectivityForm.vue";
import AssociationForm from "./AssociationForm.vue";
import AdministrationForm from "./AdministrationForm.vue";
import CheckableGroup from "#app/components/ui/Form/CheckableGroup.vue";
import Checkbox from "#app/components/ui/Form/input/Checkbox.vue";
import SocialShare from "#app/pages/Contact/SocialShare";
import TextInput from "#app/components/ui/Form/input/TextInput";

export default {
    components: {
        TextInput,
        SocialShare,
        Checkbox,
        CheckableGroup,
        PublicContainer,
        PublicLayout,
        PublicEstablishmentForm,
        TerritorialCollectivityForm,
        AdministrationForm,
        AssociationForm
    },
    computed: {
        isFrenchLocale() {
            return this.$i18n.locale === "fr";
        },
        isRequestAccess() {
            return (
                this.commonFields.request_type.includes("access-request") &&
                this.isFrenchLocale
            );
        },
        isRequestAccessAndActor() {
            return this.isRequestAccess && this.commonFields.is_actor;
        },
        isPublicEstablishmentRequest() {
            return (
                this.isRequestAccessAndActor &&
                this.requestAccessFields.organization_category ===
                    "public_establishment"
            );
        },
        isTerritorialCollectivityRequest() {
            return (
                this.isRequestAccessAndActor &&
                this.requestAccessFields.organization_category ===
                    "territorial_collectivity"
            );
        },
        isAssociationRequest() {
            return (
                this.isRequestAccessAndActor &&
                this.requestAccessFields.organization_category === "association"
            );
        },
        isAdministrationRequest() {
            return (
                this.isRequestAccessAndActor &&
                this.requestAccessFields.organization_category ===
                    "administration"
            );
        }
    },
    methods: {
        async submitForm() {
            const data = {
                ...this.commonFields,
                legal: this.commonFields.legal.length > 0,
                is_actor: !!this.commonFields.is_actor,
                ...(this.isRequestAccessAndActor
                    ? this.requestAccessFields
                    : {}),
                ...(this.isPublicEstablishmentRequest
                    ? this.publicEstablishmentFields
                    : {}),
                ...(this.isTerritorialCollectivityRequest
                    ? this.territorialCollectivityFields
                    : {}),
                ...(this.isAssociationRequest ? this.associationFields : {}),
                ...(this.isAdministrationRequest
                    ? this.administrationFields
                    : {})
            };
            this.loading = true;
            try {
                // Create a user and send an email to admins
                await contact(data);
                this.loading = false;
                let from = null;

                if (this.isRequestAccessAndActor) {
                    this.$trackMatomoEvent(
                        "Demande d'accès",
                        "Demande d'accès"
                    );
                    from = "access_request";
                } else {
                    this.$trackMatomoEvent("Contact", "Demande d'information");
                    from = "contact_others";
                }
                this.$router.push(
                    `/invitation?email=${encodeURIComponent(
                        this.commonFields.email
                    )}&first_name=${this.commonFields.first_name}&last_name=${
                        this.commonFields.last_name
                    }&from=${from}`
                );

                notify({
                    group: "notifications",
                    type: "success",
                    title: "Succès",
                    text: this.isRequestAccessAndActor
                        ? "Votre demande d'accès a été envoyée"
                        : "Votre message a bien été envoyé"
                });
            } catch (err) {
                this.loading = false;
                this.error = err;
                this.$refs.form.setErrors(err.fields);
            }
        }
    },
    data() {
        return {
            loading: false,
            error: null,
            commonFields: {
                email: this.$route.query.email || "",
                phone: "",
                first_name: "",
                last_name: "",
                request_type: [],
                legal: [],
                is_actor: null,
                access_request_message: "",
                referral: null,
                referral_other: "",
                referral_word_of_mouth: ""
            },
            requestAccessFields: {
                organization_category: null,
                position: ""
            },
            publicEstablishmentFields: {
                organization_type: null,
                organization_public: null
            },
            territorialCollectivityFields: {
                territorial_collectivity: null
            },
            associationFields: {
                association: "",
                departement: "",
                new_association_name: "",
                new_association_abbreviation: ""
            },
            administrationFields: {
                organization_administration: ""
            }
        };
    }
};
</script>

<style lang="scss">
.contact {
    // TODO: A supprimer quand le composant d'autocomplete sera refait avec le nouveau design
    .autocompleter-textfield input {
        @apply border-2 border-G200 rounded-md  py-2 outline-none;
    }

    .autocompleter-textfield input:focus {
        @apply border-primary;
    }
}
</style>
