<template>
    <div>
        <div class="mb-3 text-G600">
            Le nombre de personnes sur un site est mouvant, les données fournies
            par les acteurs - même des estimations - participent à
            l'amélioration de la connaissance.
        </div>
        <div class="flex">
            <TextInput
                id="population_total"
                label="Personnes"
                class="w-32"
                v-model="input.populationTotal"
                rules="numeric|min_value:0"
                cypressName="population_total"
            ></TextInput>
            <TextInput
                id="population_couples"
                label="Ménages"
                class="w-32 ml-5"
                v-model="input.populationCouples"
                rules="numeric|min_value:0|couplesLesserThanTotal:@population_total"
                cypressName="population_couples"
            ></TextInput>
            <TextInput
                id="population_minors"
                label="Mineurs"
                class="w-32 ml-5"
                v-model="input.populationMinors"
                rules="numeric|min_value:0|minorsLesserThanTotal:@population_total"
                cypressName="population_minors"
            ></TextInput>
        </div>
    </div>
</template>

<script>
import { extend } from "vee-validate";

extend("couplesLesserThanTotal", {
    params: ["target"],
    validate(couples, { target: total }) {
        const totalInt = parseInt(total, 10);
        return !Number.isInteger(totalInt) || parseInt(couples, 10) <= totalInt;
    },
    message: "Le nombre de ménages doit être inférieur au nombre de personnes"
});

extend("minorsLesserThanTotal", {
    params: ["target"],
    validate(minors, { target: total }) {
        const totalInt = parseInt(total, 10);
        return !Number.isInteger(totalInt) || parseInt(minors, 10) <= totalInt;
    },
    message: "Le nombre de mineurs doit être inférieur au nombre de personnes"
});

export default {
    props: {
        value: {
            type: Object,
            required: false,
            default() {
                return {
                    populationTotal: undefined,
                    populationCouples: undefined,
                    populationMinors: undefined
                };
            }
        }
    },

    data() {
        return {
            input: this.value
        };
    },

    watch: {
        value() {
            this.input = this.value;
        },

        input() {
            this.$emit("input", this.input);
        }
    }
};
</script>
