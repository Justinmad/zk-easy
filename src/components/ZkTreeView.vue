<template>
  <v-card>
    <v-row
      class="pa-4"
      justify="space-between"
    >
      <v-col cols="4">
        <v-sheet>
          <v-text-field
            v-model="search"
            label="Search"
            flat
            solo-inverted
            hide-details
            clearable
            shaped
            clear-icon="mdi-close-circle-outline"
          ></v-text-field>
        </v-sheet>
        <v-treeview
          style="height: calc(100vh - 178px);overflow-y: auto"
          dense
          open-all
          :items="items"
          :load-children="fetchNodes"
          :search="search"
          item-key="fullPath"
          activatable
          hoverable
          return-object
          color="success"
          @update:active="doSelect"
        >
          <template v-slot:label="{ item }">
            <v-tooltip v-model="item.tooltips" top>
              <template v-slot:activator="{ on }">
                <div class="text-truncate" @mouseover="e => mouseEnter(e,item)" @mouseleave="item.tooltips=false">
                  {{item.name}}
                </div>
              </template>
              <div>{{decodeURIComponent(item.name)}}</div>
            </v-tooltip>
          </template>
          <template v-slot:append="{ item }">
            <v-btn icon @click="e=>refreshNode(e,item)"
                   v-if="item.refresh">
              <v-icon
              >mdi-reload
              </v-icon>
            </v-btn>
          </template>
        </v-treeview>
      </v-col>

      <v-divider vertical></v-divider>

      <v-col
        class="text-center"
        style="height: calc(100vh - 178px)"
      >
        <v-scroll-y-transition mode="out-in">
          <div
            v-if="!selected"
            class="title grey--text text--lighten-1 font-weight-light"
            style="align-self: center;"
          >
            Select a Node
          </div>
          <NodeDataView v-else :selected="selected" height="calc(100vh - 190px)" :client="client"
                        @save="d => fetchNodes(d.item)" @create="d => fetchNodes(d.item)"
                        @delete="d => fetchNodes(d.item.parent)"/>
        </v-scroll-y-transition>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
  import AddZkNode from "./AddZkNode";
  import NodeEditor from "./NodeEditor";
  import ZkConnection from "../scripts/ZkConnectionWrapper";
  import ObjectIterator from "./ObjectIterator";
  import NodeDataView from "./NodeDataView";

  export default {
    name: "ZkTreeView",
    components: {NodeDataView, ObjectIterator, NodeEditor, AddZkNode},
    data: () => ({
      isActive: false,
      items: [
        {
          name: '/',
          fullPath: '',
          children: [],
          parent: null
        },
      ],
      selected: null,
      search: null,
      menu: false,
      lang: null,
      tooltips: null
    }),
    methods: {
      fetchNodes(item) {
        if (!item.children || item.children.length !== 0) {
          item.children = []
        }
        return this.client.getChildren(item.fullPath || item.name)
          .then(children => {
            if (children.length > 0) {
              for (let child of children) {
                item.children.push({
                  name: child,
                  fullPath: `${item.fullPath}/${child}`,
                  children: [],
                  tooltips: false,
                  refresh: false,
                  parent: item,
                })
              }
            } else {
              item.children = undefined
            }
          })
          .catch(error => this.$error(error))
      },
      doSelect(actives) {
        if (actives.length > 0) {
          if (this.selected) {
            this.selected.item.refresh = false
          }
          let item = actives[0]
          let fullPath = item.fullPath || '/'
          return this.client.getData(fullPath)
            .then(res => {
              this.selected = {
                ...res,
                fullPath,
                item
              };
              item.refresh = true
            }).catch(e => this.$error(e))
        } else {
          this.selected.item.refresh = false
          this.selected = null
        }
      },
      mouseEnter(event, item) {
        if (event.target) {
          item.tooltips = this.isEllipsisActive(event.target)
        }
      },
      isEllipsisActive(e) {
        return (e.offsetWidth < e.scrollWidth);
      },
      refreshNode(e, item) {
        e.stopPropagation()
        this.fetchNodes(item)
      },
    },
    props: {
      client: {type: ZkConnection}
    }
  }
</script>

<style scoped>
</style>
