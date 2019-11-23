<template>
  <v-tabs
    v-model="tab"
    show-arrows
    height="48"
    next-icon="mdi-arrow-right-bold-box-outline"
    prev-icon="mdi-arrow-left-bold-box-outline"
  >
    <v-tabs-slider></v-tabs-slider>
    <v-tab
      v-for="i in opened"
      :key="i.title"
    >
      {{ i.title }}
    </v-tab>

    <v-tab-item
      v-for="i in opened"
      :key="i.title"
    >
      <ZkTreeView v-if="i.view === 'tree'" :client="i"/>
      <ZkDirectoryView v-else :client="i"/>
    </v-tab-item>
  </v-tabs>
</template>

<script>
  import ZkTreeView from "./ZkTreeView";
  import ZkDirectoryView from "./ZkDirectoryView";

  export default {
    name: "ZkInstanceTabs",
    components: {ZkDirectoryView, ZkTreeView},
    data: () => ({}),
    computed: {
      tab: {
        get() {
          return this.value
        },
        set(newVal, oldVal) {
          if (newVal !== oldVal) {
            this.$emit("input", newVal)
          }
        }
      }
    },
    methods: {},
    props: {
      opened: {
        type: Array
      },
      value: Number,
    },
  }
</script>

<style scoped>

</style>
