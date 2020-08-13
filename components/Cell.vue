<template>
    <div
        :class="['cell', cell.odd ? 'light' : 'dark', { dead, targeted, selected, moveable }]"
        :style="{ flex: size }"
        @click="e => $emit('click', cell)"
    >
        <div v-if="cell.player" :class="['piece', cell.player]">
            <img v-if="cell.king" src="../images/crown.png" />
        </div>
        <div v-if="!cell.odd" class="name">{{ cell.p }}</div>
    </div>
</template>

<script>
export default {
    props: [
        'cell',
        'dead',
        'selected',
        'targeted',
        'moveable',
        'size',
    ],
}
</script>

<style>
.cell {
    display: flex;
    justify-content: center;
    align-items: stretch;
    position: relative;
}
.cell:before {
    content: '';
    display: table;
    padding-top: 100%;
}
.cell.light {
    background-color: white;
}
.cell.dark {
    background-color: #7a7a7a;
}
.cell.moveable {
    background-color: #609f60;
    cursor: pointer;
}
.cell.selected {
    background-color: #335533;
    cursor: pointer;
}
.cell.targeted {
    background-color: #222222;
    cursor: pointer;
}
.cell .name {
    position: absolute;
    left: 5px;
    top: 3px;
    font-size: .5em;
    font-weight: bold;
    opacity: .66;
}

.piece {
    align-self: center;
    display: flex;
    justify-content: center;
    align-items: center;

    width: 75%;
    height: 75%;

    border: 0.6vh solid;
    border-radius: 50%;
}
.dead .piece {
    opacity: .25;
}
.piece.white {
    background: radial-gradient(#e5e5e5, #aaaaaa);
    border-color: #efefef;
}
.piece.black {
    background: radial-gradient(#777777, #111111);
    border-color: #212121;
}
.piece img {
    width: 65%;
    height: 65%;
}
</style>
