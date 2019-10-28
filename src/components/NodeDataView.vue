<template>
  <v-card
    flat
  >
    <NodeEditor :height="height" v-model="selected.data"></NodeEditor>
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
        <ObjectIterator :data="selected.metadata"/>
      </v-menu>
      <v-spacer></v-spacer>
      <v-divider color="teal" vertical></v-divider>
      <v-btn x-small text color="error" :loading="loading.delete" @click="doDelete">delete</v-btn>
      <v-btn x-small text color="success" :loading="loading.save" @click="doSave">save</v-btn>
      <AddZkNode @save="doAdd" :loading="loading.add"/>
    </v-card-actions>
  </v-card>
</template>

<script>
  import NodeEditor from "./NodeEditor";
  import AddZkNode from "./AddZkNode";
  import ObjectIterator from "./ObjectIterator";
  import ZkConnectionWrapper from "../scripts/ZkConnectionWrapper";

  export default {
    name: "NodeDataView",
    components: {ObjectIterator, AddZkNode, NodeEditor},
    data: () => ({
      menu: false,
      loading: {
        delete: false,
        save: false,
        add: false,
      },
    }),
    methods: {
      doDelete() {
        this.$confirm({
          message: `Confirm to delete the node: ${this.selected.fullPath}`,
          checkbox: 'Remove recursive',
          callback: (recursive) => {
            this.loading.delete = true
            this.client.delete(this.selected.fullPath, this.selected.metadata.version, recursive)
              .then(() => {
                this.$success("delete success")
                this.$emit("delete", this.selected)
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
            this.$emit("save", this.selected)
          }).catch(e => this.$error(e))
          .finally(() => this.loading.save = false)
      },
      doAdd(node) {
        this.loading.add = true
        let path = `${this.selected.fullPath === '/' ? '' : this.selected.fullPath}/${node.path}`;
        this.client.create(path, node.data, node.mode)
          .then(() => {
            this.$success(`Node: ${path} is created`)
            this.$emit("create", this.selected)
          })
          .catch(e => this.$error(e))
          .finally(() => this.loading.add = false)
      }
    },
    props: {
      selected: Object,
      client: ZkConnectionWrapper,
      height: String
    }
  }
</script>

<style scoped>

</style>
