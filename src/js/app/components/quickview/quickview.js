import simplebar from 'simplebar-vue';

export default {
    components: {
        simplebar,
    },
    props: {
        town: Object,
        origin: Event, // this event is the one that caused that quick-view to appear
    },
    computed: {
        active() {
            return !!this.town;
        },
    },
    mounted() {
        document.addEventListener('click', this.checkOutsideClick);
    },
    destroyed() {
        document.removeEventListener('click', this.checkOutsideClick);
    },
    methods: {
        formatDate: ts => App.formatDate(ts),
        checkOutsideClick(event) {
            if (!this.town) {
                return;
            }

            // ignore the origin event
            if (event === this.origin) {
                return;
            }

            // if the click was outside ourselves, share the info
            if (!this.$refs.quickviewPanel.$el.contains(event.target)) {
                this.$emit('outside-click', event);
            }
        },
        showTown() {
            const routerData = this.$router.resolve(`/site/${this.town.id}`);
            window.open(routerData.href, '__blank');
        },
    },
};
