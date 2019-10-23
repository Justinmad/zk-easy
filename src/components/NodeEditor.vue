<template>
  <div>
    <v-sheet>
      <v-select
        v-model="lang"
        :items="langItems"
        label="Lang"
        flat
        shaped
        solo-inverted
        hide-details
        clearable
        clear-icon="mdi-close-circle-outline"
      ></v-select>
    </v-sheet>
    <AceEditor :height="height||'calc(100vh - 600px)'" v-model="data" :lang="lang||'smarty'"/>
  </div>
</template>

<script>
  import AceEditor from "./AceEditor";

  export default {
    name: "NodeEditor",
    components: {AceEditor},
    data: () => ({
      langItems: ['yaml', 'json', 'xml', 'plain_text', 'smarty'],
      lang: null
    }),
    computed: {
      data: {
        get() {
          return this.value || ''
        },
        set(val) {
          this.$emit("input", val)
        }
      }
    },
    props: ['value', 'height']
  }
</script>

<style scoped>

</style>
