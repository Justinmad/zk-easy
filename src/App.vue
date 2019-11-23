<template>
  <v-app>
    <v-system-bar class="drag" @dblclick="$winMax" app>
      <v-icon class="no-drag" v-if="isWin" @click="$winMin">mdi-minus</v-icon>
      <v-icon class="no-drag" v-if="isWin" @click="$winMax">mdi-checkbox-blank-outline</v-icon>
      <v-icon class="no-drag" v-if="isWin" @click="$winClose">mdi-close</v-icon>
      <v-spacer></v-spacer>
      <span>Zookeeper Connections</span>
    </v-system-bar>
    <ZkInstancesDrawer @select="selectClient" @open="openClient" @close="closeClient"/>
    <v-content>
      <ZkInstanceTabs v-model="selected" :opened="opened"/>
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
      selected: null,
      isWin: process.platform === 'win32',
    }),
    methods: {
      selectClient(instance) {
        if (instance.connected) {
          this.selected = this.opened.indexOf(instance)
        }
      },
      openClient(instance) {
        this.opened.push(instance)
        this.selectClient(instance)
      },
      closeClient(instance) {
        this.opened.splice(this.opened.indexOf(instance), 1);
      },
    },
  };
</script>
<style type="text/css">
  .drag {
    -webkit-app-region: drag;
    -webkit-user-select: none;
  }

  .no-drag {
    -webkit-app-region: no-drag
  }
</style>
