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
  import AddZkNode from "./AddZkNode";
  import NodeEditor from "./NodeEditor";
  import ZkConnection from "../scripts/ZkConnectionWrapper";

  export default {
    name: "ZkTreeView",
    components: {NodeEditor, AddZkNode},
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
        return this.client.getChildren(item.fullPath || item.name)
          .then(children => {
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
          })
          .catch(error => this.$error(error))
      },
      input(actives) {
        if (actives.length > 0) {
          let item = actives[0];
          let fullPath = item.fullPath || '/';
          return this.client.getData(fullPath)
            .then(res => {
              this.selected = {
                ...res,
                fullPath,
                item
              };
            }).catch(e => this.$error(e))
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
            this.loading.delete = true
            this.client.delete(this.selected.fullPath, this.selected.metadata.version, recursive)
              .then(() => {
                this.$success("delete success")
                if (this.selected.item.parent) {
                  this.fetchNodes(this.selected.item.parent)
                }
              })
              .catch(e => this.$error(e))
              .finally(() => this.loading.delete = false)
          }
        })
      },
      doSave() {
        this.loading.save = true
        this.client.setData(this.selected.fullPath, this.selected.data, this.selected.metadata.version)
          .then(() => {
            this.$success("save success")
            this.fetchNodes(this.selected.item);
          }).catch(e => this.$error(e))
          .finally(() => this.loading.save = false)
      },
      doAdd(node) {
        this.loading.save = true
        let path = `${this.selected.fullPath === '/' ? '' : this.selected.fullPath}/${node.path}`;
        this.client.create(path, node.data, node.mode)
          .then(() => {
            this.$success(`Node: ${path} is created`)
            this.fetchNodes(this.selected.item)
          })
          .catch(e => this.$error(e))
          .finally(() => this.loading.add = false)
      }
    },
    props: {
      client: {type: ZkConnection}
    }
  }
</script>

<style scoped>
</style>
