<template>
    <MapV2 v-model="input" :zoom="zoom"></MapV2>
</template>

<script>
export default {
    props: {
        value: {
            value: Array,
            required: false
        }
    },

    data() {
        return {
            input: this.value
        };
    },

    computed: {
        zoom() {
            return this.input ? 15 : undefined;
        }
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
