<template>
    <div class="text-center mt-40 max-w-screen-lg">
        <h2 class="text-display-lg text-primary">
            {{ $t("landingPage.newsletter.title") }}
        </h2>
        <div class="mb-4 max-w-screen-sm mx-auto">
            {{ $t("landingPage.newsletter.text") }}
        </div>
        <Button
            variant="primary"
            href="https://email.developpement-durable.gouv.fr/users/subscribe/js_id/5n4i/id/1"
            >{{ $t("landingPage.newsletter.cta") }}</Button
        >
        <div
            class="grid grid-cols-1 md:grid-cols-3 text-left gap-8 md:gap-32 mt-6 mb-8"
        >
            <div v-for="newsletter in newsletters" :key="newsletter.link">
                <div class="capitalize text-primary font-bold">
                    {{
                        newsletter.date.toLocaleString("default", {
                            month: "long",
                            year: "numeric"
                        })
                    }}
                </div>
                <div v-html="newsletter.title"></div>
                <a :href="newsletter.link" class="link">
                    {{ $t("landingPage.newsletter.link") }}</a
                >
            </div>
        </div>
        <div>
            <a
                class="link"
                href="https://www.gouvernement.fr/resorption-des-bidonvilles"
                >{{ $t("landingPage.newsletter.viewAll") }}</a>
        </div>
    </div>
</template>

<script>
import { newsletters } from "./newsletters";

export default {
    data() {
        return {
            newsletters
        };
    }
};
</script>
