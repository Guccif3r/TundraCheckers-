<template>
    <v-container fill-height back>
        <v-layout justify-center align-center>
            <v-flex justify-center align-center text-center>
                <v-row justify-center>
                    <v-col cols="12">
                        <v-alert
                            v-model="loggedin"
                            prominent
                            type="success"
                            transition="scale-transition"
                        >
                            <v-row align="center">
                                <v-col class="grow">Добро пожаловать, {{ $store.state.user.name }}!</v-col>
                                <v-col class="shrink">
                                    <v-btn outlined @click="logout">Выйти</v-btn>
                                </v-col>
                            </v-row>
                        </v-alert>
                        <v-alert
                            v-model="show"
                            prominent
                            dismissible
                            type="error"
                            transition="scale-transition"
                        >{{ error }}</v-alert>
                    </v-col>
                </v-row>
                <v-row justify-center>
                    <v-col cols="12">
                        <v-form v-if="!loggedin" ref="form" v-model="valid" lazy-validation>
                            <v-row justify-center>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="user"
                                        :rules="[rules.email]"
                                        label="Электронная почта"
                                        outlined
                                        required
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row justify-center>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="pass"
                                        type="password"
                                        :rules="[rules.required, rules.min]"
                                        label="Пароль"
                                        outlined
                                        required
                                        hint="Не менее 10 символов"
                                        counter
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row justify-center>
                                <v-col justify-center cols="12">
                                    <v-btn color="success" large @click="login">Войти</v-btn>
                                    <v-btn
                                        color="success"
                                        large
                                        outlined
                                        @click="register"
                                    >Зарегистрироваться</v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-col>
                </v-row>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
let email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export default {
    data: _ => ({
        user: '',
        pass: '',
        show: false,
        error: null,
        valid: true,
        rules: {
            required: v => !!v || 'Обязательное',
            min: v => 10 <= v.length || 'Не менее 10 символов',
            email: v => email.test(v) || 'Должно быть email-адресом',
        },
    }),

    computed: {
        loggedin() {
            return this.$store.state.user.loggedin
        },
    },

    methods: {
        clear() {
            this.user = ''
            this.pass = ''
            this.error = null
        },

        async report(f) {
            try {
                await f()
                this.clear()
                try {
                    this.$refs.form.resetValidation()
                } catch (e) {}
                this.show = false
            } catch (e) {
                this.error = e.message
                this.show = true
            }
        },

        async register() {
            await this.report(async _ => {
                await this.$store.dispatch('user/register', {
                    user: this.user,
                    pass: this.pass,
                })
            })
        },

        async login() {
            await this.report(async _ => {
                await this.$store.dispatch('user/login', {
                    user: this.user,
                    pass: this.pass,
                })
            })
        },

        async logout() {
            await this.report(async _ => {
                await this.$store.dispatch('user/logout')
                this.show = false
            })
        },
    },
}
</script>

<style>
</style>
