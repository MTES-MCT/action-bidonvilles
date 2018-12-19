import NavBar from '#src/components/navbar/navbar.vue';

export default {
    components: {
        NavBar,
    },
    data() {
        return {
            email: '',
            description: '',
            success: false,
            errors: undefined,
        };
    },
    methods: {
        submit() {
            if (this.email !== '' && this.description !== '') {
                this.success = true;
            } else {
                this.errors = {
                    user_message: 'Données incorrectes !',
                    details: {
                        email: 'Ce champ est obligatoire',
                        description: 'Ce champ est obligatoire',
                    },
                };
            }
        },
    },
};
