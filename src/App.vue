<template>
  <v-app>
    <ZkInstancesDrawer @select="selectClient" @open="openClient" @close="closeClient"/>
    <v-content>
      <v-container>
        <ZkInstanceTabs v-model="selected" :opened="opened"/>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import ZkInstancesDrawer from "./components/ZkInstancesDrawer";
  import ZkInstanceTabs from "./components/ZkInstanceTabs";

  export default {
    name: 'App',
    components: {
      ZkInstanceTabs,
      ZkInstancesDrawer
    },
    data: () => ({
      opened: [],
      selected: null
    }),
    methods: {
      selectClient(instance) {
        if (instance.connected) {
          this.selected = this.opened.indexOf(instance)
        }
      },
      openClient(instance) {
        this.opened.push(instance);
      },
      closeClient(instance) {
        this.opened.splice(this.opened.indexOf(instance), 1);
      }
    },
  };
</script>
