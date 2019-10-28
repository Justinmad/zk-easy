<template>
  <v-card>
    <v-container
      style="height: calc(100vh - 72px);">
      <v-card flat :height="selected?'50%':'100%'">
        <v-toolbar dense floating>
          <v-btn icon :disabled="paths.length<1" @click="goBack">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-btn icon @click="refreshDir">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-text-field
            hide-details
            append-icon="mdi-magnify"
            single-line
            v-model="search"
          ></v-text-field>
        </v-toolbar>
        <v-item-group style="height: 90%; overflow-y: auto">
          <v-container fluid>
            <v-row>
              <v-col
                v-for="dir in filterItems"
                cols="2"
                :key="dir.name">
                <v-item>
                  <div class="text-center">
                    <v-icon
                      x-large
                      :color="dir.active ? 'primary' : ''"
                      @click.prevent.default="handleClick(dir)">
                      mdi-folder
                    </v-icon>
                    <div>{{decodeURIComponent(dir.name)||'/'}}</div>
                  </div>
                </v-item>
              </v-col>
            </v-row>
          </v-container>
        </v-item-group>
      </v-card>
      <NodeDataView v-if="selected" height="calc(50vh - 125px)" :client="client" :selected="selected"
                    @save="refreshData" @delete="refreshDir" @create="refreshDir"
      ></NodeDataView>
    </v-container>
  </v-card>
</template>

<script>
  import NodeEditor from "./NodeEditor";
  import ObjectIterator from "./ObjectIterator";
  import ZkConnectionWrapper from "../scripts/ZkConnectionWrapper";
  import NodeDataView from "./NodeDataView";

  export default {
    name: "ZkDirectoryView",
    components: {NodeDataView, ObjectIterator, NodeEditor},
    data: () => ({
      paths: [],
      items: [],
      selected: null,
      search: null,
      click: {
        count: 0,
        delay: 200,
        timer: null
      },
    }),
    methods: {
      calcBasePath(current) {
        let parent
        if (this.paths.length === 0) {
          if (current) parent = '/'
          else parent = ''
        } else if (this.paths.length === 1) {
          parent = '/'
          if (current) parent += current
        } else {
          parent = '/' + this.paths.slice(1).join('/')
          if (current) parent = parent + '/' + current
        }
        return parent
      },
      async refreshDir() {
        let basePath = this.calcBasePath()
        if (basePath) {
          await this.client.getChildren(basePath)
            .then(children => {
              this.items = children
            })
        } else {
          this.items = ['/']
        }
        if (this.items.length === 0) {
          this.selected = {
            name: basePath,
            fullPath: basePath,
            active: true, data: null,
            metadata: null
          }
          this.refreshDataInternal()
        } else {
          if (this.selected) this.refreshData()
        }
      },
      entryDir(dir) {
        this.search = null
        this.selected = null
        this.paths.push(dir)
        this.refreshDir()
      },
      goBack() {
        this.paths.pop()
        this.selected = null
        this.refreshDir()
      },
      refreshData() {
        this.refreshDataInternal(this.selected.name)
      },
      refreshDataInternal(p) {
        let path = this.calcBasePath(p)
        this.client.getData(path)
          .then(node => {
            this.selected.data = node.data
            this.selected.metadata = node.metadata
          })
      },
      handleClick(dir) {
        this.click.count++
        if (this.click.count === 1) {
          this.click.timer = setTimeout(() => {
            this.click.count = 0
            if (this.selected) {
              this.selected.active = false
              if (this.selected.name === dir.name) {
                this.selected = null
                return
              }
            }
            dir.fullPath = this.calcBasePath(dir.name)
            this.selected = dir
            this.selected.active = true
            this.refreshData()
          }, this.click.delay)
        } else if (this.click.count === 2) {
          clearTimeout(this.click.timer)
          this.click.count = 0
          this.entryDir(dir.name)
        }
      }
    },
    computed: {
      filterItems() {
        let paths;
        if (this.search) {
          paths = this.items.filter(s => s.includes(this.search))
        } else {
          paths = this.items
        }
        return paths.map(name => ({
          name: name,
          active: this.selected && this.selected.name === name,
          data: null,
          metadata: null
        }))
      }
    },
    created() {
      this.entryDir('/')
    },
    props: {
      client: ZkConnectionWrapper
    }
  }
</script>

<style scoped>

</style>
