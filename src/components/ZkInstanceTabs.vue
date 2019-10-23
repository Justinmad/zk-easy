<template>
  <v-tabs
    v-model="tab"
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
      <ZkTreeView :client="i.client"/>
    </v-tab-item>
  </v-tabs>
</template>

<script>
  import ZkTreeView from "./ZkTreeView";

  export default {
    name: "ZkInstanceTabs",
    components: {ZkTreeView},
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
      value: Number
    },
  }
</script>

<style scoped>

</style>
