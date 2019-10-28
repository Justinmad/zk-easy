<template>
  <v-navigation-drawer permanent app>
    <v-toolbar>
      <v-toolbar-title class="title">
        Connections
      </v-toolbar-title>
    </v-toolbar>

    <v-divider></v-divider>

    <v-list dense nav>
      <v-list-item v-for="(item,i) in instances" :key="i"
                   @click="$emit('select',item)">
        <v-list-item-icon>
          <v-btn icon small>
            <v-tooltip v-if="item.view==='tree'" right>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" @click="item.view='directory'">mdi-file-tree</v-icon>
              </template>
              <span>Change to directory view</span>
            </v-tooltip>
            <v-tooltip v-else right>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" @click="item.view='tree'">mdi-folder-multiple-outline</v-icon>
              </template>
              <span>Change to tree view</span>
            </v-tooltip>
          </v-btn>
        </v-list-item-icon>
        <v-menu v-model="item.menu" offset-y bottom>
          <template v-slot:activator="{ on }">
            <v-list-item-content @mouseup="item.menu=true">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list>
            <v-list-item @click="editConn(item)">
              <v-list-item-title>edit</v-list-item-title>
            </v-list-item>
            <v-list-item @click="deleteConn(item)">
              <v-list-item-title>delete</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-list-item-action>
          <v-btn icon small :loading="item.loading" :color="item.connected?'success':'grey'">
            <v-tooltip v-if="item.connected" right>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" @click="doClose(item)">mdi-lan-connect</v-icon>
              </template>
              <span>Disconnect</span>
            </v-tooltip>
            <v-tooltip v-else right>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" @click="doOpen(item)">mdi-lan-disconnect</v-icon>
              </template>
              <span>Connect</span>
            </v-tooltip>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-divider v-if="instances.length"></v-divider>
    <NewZkInstance v-model="todoEdit" @create="save" :exists="instances"/>
  </v-navigation-drawer>
</template>

<script>
  import ZkConnection from "../scripts/ZkConnectionWrapper";
  import NewZkInstance from "./NewZkInstance";
  import * as Config from '../scripts/FileConfig'

  export default {
    name: "ZkInstancesDrawer",
    components: {NewZkInstance},
    data: () => ({
      instances: [],
      todoEdit: null
    }),
    methods: {
      save(config) {
        this.instances.push(new ZkConnection(config));
      }, doOpen(instance) {
        instance.init(() => {
          this.$emit('close', instance)
        }).then(() => {
          this.$emit('open', instance)
        }).catch(e => {
          this.$error(e)
        })
      }, doClose(instance) {
        instance.close().catch(e => {
          this.$error(e)
        })
      }, editConn(instance) {
        if (instance.connected) {
          this.doClose(instance)
        }
        this.todoEdit = instance
      }, deleteConn(instance) {
        if (instance.connected) {
          this.doClose(instance)
        }
        this.instances.splice(this.instances.indexOf(instance), 1)
      }
    },
    watch: {
      instances: {
        deep: true,
        handler: (val) => {
          Config.update(val.map(i => {
            return {
              title: i.title,
              host: i.host,
              port: i.port,
              view: i.view,
            }
          }))
        }
      }
    },
    mounted() {
      Config.load().forEach(c => {
        this.save(c)
      })
    }
  }
</script>

<style scoped>

</style>
