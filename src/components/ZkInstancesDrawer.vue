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
        <v-menu v-model="item.menu" offset-y bottom>
          <template v-slot:activator="{ on }">
            <v-list-item-content @mouseup="item.menu=true">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list>
            <v-list-item @click="editConn(item)">
              <v-list-item-title>编辑</v-list-item-title>
            </v-list-item>
            <v-list-item @click="deleteConn">
              <v-list-item-title>删除</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-list-item-action>
          <v-btn icon small :loading="item.loading" :color="item.connected?'success':'grey'">
            <v-tooltip v-if="item.connected" right>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" @click="doClose(item)">mdi-lan-connect</v-icon>
              </template>
              <span>点击断开</span>
            </v-tooltip>
            <v-tooltip v-else right>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" @click="doOpen(item)">mdi-lan-disconnect</v-icon>
              </template>
              <span>点击连接</span>
            </v-tooltip>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-divider v-if="instances.length"></v-divider>
    <NewZkInstance v-model="todoEdit" @create="save" :exists="unionSet"/>
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
      unionSet: new Set(),
      todoEdit: null
    }),
    methods: {
      save(config) {
        if (config instanceof ZkConnection) {
          let newUnionSet = new Set();
          this.instances.forEach(i => {
            newUnionSet.add(i.title)
          })
          config.loading = false
          this.unionSet = newUnionSet
        } else {
          this.unionSet.add(config.title);
          this.instances.push(new ZkConnection(config));
        }
      }, doOpen(instance) {
        if (!instance.connected) {
          instance.loading = true
          instance.onConnected = () => {
            this.$emit('open', instance)
            this.$success("Connected")
          }
          instance.init()
        }
      }, doClose(instance) {
        let has = this.unionSet.has(instance.title);
        if (has) {
          instance.loading = true
          instance.onClosed = () => {
            this.$emit('close', instance)
            this.$info("Closed")
          }
          instance.close()
        }
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
      instances(val) {
        Config.update(val.map(i => {
          return {
            title: i.title,
            host: i.host,
            port: i.port
          }
        }))
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
