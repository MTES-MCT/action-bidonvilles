<template>
    <footer class="bg-black text-white py-8" role="contentinfo">
        <PublicContainer>
            <div class="max-w-screen-lg mx-auto">
                <div class="md:flex flex-row justify-between">
                    <ul>
                        <li>
                            <font-awesome-icon
                                icon="envelope"
                            ></font-awesome-icon>
                        </li>
                        <li>
                            <h4>{{ $t("footer.contact") }}</h4>
                        </li>
                        <li>
                            <h4>
                                <a
                                    class="underline"
                                    href="mailto:contact@resorption-bidonvilles.beta.gouv.fr"
                                    >contact@resorption-bidonvilles.beta.gouv.fr</a
                                >
                            </h4>
                        </li>
                    </ul>

                    <ul>
                        <li v-if="$i18n.locale === 'fr'">
                            <router-link to="/conditions-d-utilisation">{{
                                $t("footer.cgus")
                            }}</router-link>
                        </li>
                        <li>
                            <router-link to="/stats">{{
                                $t("footer.statistics")
                            }}</router-link>
                        </li>
                        <li>
                            {{
                                $t("footer.RGAA")
                            }}
                        </li>
                        <li>
                            {{
                                $t("footer.RGAA")
                            }}
                        </li>
                        <li>
                            <router-link to="/mentions-legales">{{
                                $t("footer.legal")
                            }}</router-link>
                        </li>
                    </ul>
                </div>
            </div>
        </PublicContainer>
    </footer>
</template>

<script>
import PublicContainer from "./PublicContainer.vue";

export default {
    components: {
        PublicContainer
    }
};
</script>
