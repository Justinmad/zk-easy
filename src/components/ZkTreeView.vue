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
          @update:active="input"
        >
          <template v-slot:label="{ item }">
            <v-tooltip v-model="item.tooltips" top>
              <template v-slot:activator="{ on }">
                <div class="text-truncate" @mouseover="e => mouseEnter(e,item)" @mouseleave="item.tooltips=false">
                  {{item.name}}
                </div>
              </template>
              <span>{{item.name}}</span>
            </v-tooltip>
          </template>
          <template v-slot:append="{ item }">
            <v-btn icon @click="e=>refreshNode(e,item)"
                   v-if="selected && ((item.fullPath==='' && selected.fullPath==='/') || (item.fullPath === selected.fullPath))">
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
          <v-card
            v-else
            :key="selected.id"
            flat
          >
            <NodeEditor height="calc(100vh - 190px)" v-model="selected.data"></NodeEditor>
            <v-divider></v-divider>
            <v-card-actions>
              <v-menu
                v-model="menu"
                :close-on-content-click="false"
                top
                offset-y
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    color="teal"
                    x-small text
                    v-on="on"
                  >
                    metadata
                  </v-btn>
                </template>
                <v-simple-table dense>
                  <template v-slot:default>
                    <thead>
                    <tr>
                      <th class="text-center">Name</th>
                      <th class="text-center">Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in Object.keys(selected.metadata)" :key="item.name">
                      <td>{{ item }}</td>
                      <td>{{ selected.metadata[item] }}</td>
                    </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-menu>
              <v-spacer></v-spacer>
              <v-divider color="teal" vertical></v-divider>
              <v-btn x-small text color="error" :loading="loading.delete" @click="doDelete">delete</v-btn>
              <v-btn x-small text color="success" @click="doSave">save</v-btn>
              <AddZkNode v-model="selected" @save="doAdd"/>
            </v-card-actions>
          </v-card>
        </v-scroll-y-transition>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
  import AceEditor from "./AceEditor";
  import AddZkNode from "./AddZkNode";
  import NodeEditor from "./NodeEditor";
  import {parseStat} from "../scripts/Utils";

  const EMPTY = Buffer.alloc(0)

  export default {
    name: "ZkTreeView",
    components: {NodeEditor, AddZkNode, AceEditor},
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
      loading: {
        delete: false,
        save: false,
        add: false,
      }
    }),
    methods: {
      fetchNodes(item) {
        if (!item.children || item.children.length !== 0) {
          item.children = []
        }
        let func = resolve => {
          this.client.getChildren(item.fullPath || item.name, (error, children) => {
            if (error) {
              this.$error(error)

            } else {
              if (children.length > 0) {
                for (let child of children) {
                  item.children.push({
                    name: child,
                    fullPath: `${item.fullPath}/${child}`,
                    children: [],
                    tooltips: false,
                    parent: item,
                  })
                }
              } else {
                item.children = undefined
              }
            }
            resolve()
          })
        }
        return new Promise(func);
      },
      formatJson(nodeData, space) {
        try {
          let parse = JSON.parse(nodeData)
          nodeData = JSON.stringify(parse, null, space)
          return nodeData;
        } catch (e) {
          return nodeData;
        }
      },
      input(actives) {
        if (actives.length > 0) {
          let item = actives[0];
          let fullPath = item.fullPath || '/';
          return this.client.getData(fullPath, (error, data, stat) => {
            let nodeData = data && data.toString() || ''
            if (nodeData) {
              nodeData = this.formatJson(nodeData, 2);
            }
            this.selected = {
              metadata: parseStat(stat),
              data: nodeData,
              fullPath,
              item: item
            };
          })
        } else {
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
      doDelete() {
        this.$confirm({
          message: `Confirm to delete the node: ${this.selected.fullPath}`,
          checkbox: 'Remove recursive',
          callback: (recursive) => {
            try {
              this.loading.delete = true
              let cb = (error) => {
                if (error) {
                  this.$error(error)
                } else {
                  this.$success("delete success")
                  if (this.selected.item.parent) {
                    this.fetchNodes(this.selected.item.parent)
                  }
                }
                this.loading.delete = false
              }
              if (recursive) {
                this.client.removeRecursive(this.selected.fullPath, -1, cb)
              } else {
                this.client.remove(this.selected.fullPath, this.selected.metadata.version, cb)
              }
            } catch (e) {
              this.$error(e)
              this.loading.delete = false
            }
          }
        })
      },
      doSave() {
        this.loading.save = true
        let data = this.selected.data ? Buffer.from(this.formatJson(this.selected.data)) : EMPTY;
        this.client.setData(this.selected.fullPath, data, this.selected.metadata.version,
          (error) => {
            if (error) {
              this.$error(error)

            } else {
              this.$success("save success")
              this.fetchNodes(this.selected.item);
            }
            this.loading.save = false
          })
      },
      doAdd(node) {
        this.loading.save = true
        let parentPath = this.selected.fullPath === '/' ? '' : this.selected.fullPath;
        this.client.create(`${parentPath}/${node.path}`, node.data ? Buffer.from(node.data) : EMPTY, node.mode,
          (error, path) => {
            if (error) {
              this.$error(error)
            } else {
              this.$success(`Node: ${path} is created`)
              this.fetchNodes(this.selected.item)
            }
            this.loading.add = false
          })
      }
    },
    props: {
      client: {type: Object}
    }
  }
</script>

<style scoped>
</style>
