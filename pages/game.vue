<template>
    <field />
</template>

<script>
import Field from '~/components/Field.vue'

export default {
    middleware: 'auth',
    components: { Field },
}
</script>
