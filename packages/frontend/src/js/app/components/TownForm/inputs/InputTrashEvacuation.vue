<template>
    <CheckableGroup
        label=" "
        direction="horizontal"
        id="trash_evacuation"
        validationName="Évacuation des déchets"
        rules="required"
    >
        <Radio
            variant="card"
            label="Oui"
            v-model="checked"
            :checkValue="1"
            cypressName="trash_evacuation"
        ></Radio>
        <Radio
            variant="card"
            label="Non"
            v-model="checked"
            :checkValue="0"
            cypressName="trash_evacuation"
        ></Radio>
        <Radio
            variant="card"
            label="Inconnu"
            v-model="checked"
            :checkValue="-1"
            cypressName="trash_evacuation"
        ></Radio>
    </CheckableGroup>
</template>

<script>
export default {
    props: {
        value: {
            type: Number,
            required: false,
            default: undefined
        }
    },

    data() {
        return {
            checked: this.value
        };
    },

    watch: {
        value() {
            this.checked = this.value;
        },

        checked() {
            this.$emit("input", this.checked);
        }
    }
};
</script>
