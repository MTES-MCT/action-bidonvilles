<template>
    <div
        class="grid grid-cols-1 grid-col-dense md:grid-cols-3 md:space-x-4 xl:grid-cols-4"
    >
        <div v-for="(guest, index) in this.guestList" v-bind:key="index">
            <div class="pb-2 md:mb-4">
                <div class="shadow-lg">
                    <div
                        class="px-4 py-4 pb-2 bg-white border-1 border-gray-200 font-bold"
                    >
                        {{ guest.first_name }} {{ guest.last_name }}
                    </div>
                    <div class="p-4 pt-0 bg-white border-b border-gray-200">
                        {{ guest.email }}
                    </div>
                    <div class="p-4 bg-white border-gray-200 text-right">
                        <Button
                            class="m-2"
                            variant="primaryText"
                            @click="deleteItem(index)"
                            >Supprimer</Button
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "InvitationCardStack",
    data() {
        return {};
    },
    props: {
        guestList: {
            type: Array,
            required: false,
            default() {
                return [];
            }
        }
    },
    methods: {
        deleteItem(index) {
            this.$emit("delete-guest", index);
        }
    }
};
</script>
