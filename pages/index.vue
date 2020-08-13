<template>
    <v-container class="fill-height" fluid>
        <div class="back-hero"></div>
        <v-row justify="center" align="center">
            <v-btn
                v-if="!$store.state.user.loggedin"
                x-large
                color="success"
                @click="$router.push(`/sign-in`)"
            >Войти</v-btn>
            <v-btn
                v-else
                x-large
                color="success"
                @click="$router.push(`/lobby`)"
            >Перейти в игровой зал</v-btn>
        </v-row>
    </v-container>
</template>

<script>
export default {}
</script>

<style>
.back-hero {
    background-size: cover;
    background-position: center;
    background-image: url(../images/home.jpg);
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    filter: blur(2px);
}
</style>
