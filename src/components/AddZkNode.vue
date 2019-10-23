<template>
  <v-dialog
    v-model="dialog"
    width="600"
    persistent>
    <template v-slot:activator="{ on }">
      <v-btn x-small text color="primary" v-on="on">
        add
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Create Node</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="nodeForm"
                v-model="valid">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Path" v-model="node.path"
                              placeholder="node path" :rules="rules"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select label="Mode" v-model="node.mode" item-text="name" item-value="value"
                          :items="zkModes"
                          placeholder="node mode"></v-select>
              </v-col>
              <v-col cols="12">
                <div><span>Node Data</span></div>
                <NodeEditor height="calc(100vh - 600px)" v-model="node.data"></NodeEditor>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text
          color="success"
          @click="dialog = false"
        >
          close
        </v-btn>
        <v-divider vertical></v-divider>
        <v-btn
          color="primary"
          text
          @click="doSave"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import AceEditor from "./AceEditor";
  import NodeEditor from "./NodeEditor";

  export default {
    name: "AddZkNode",
    components: {NodeEditor, AceEditor},
    data: () => ({
      dialog: false,
      valid: false,
      rules: [v => !!v || 'this field is required'],
      node: {},
      zkModes: [
        {
          name: 'PERSISTENT',
          value: 0
        }, {
          name: 'PERSISTENT_SEQUENTIAL',
          value: 2
        }, {
          name: 'EPHEMERAL',
          value: 1
        }, {
          name: 'EPHEMERAL_SEQUENTIAL',
          value: 3
        },
      ]
    }), methods: {
      doSave() {
        if (this.$refs.nodeForm.validate()) {
          this.$emit('save', this.node)
          this.dialog = false
        }
      }
    },
    props: {value: Object}
  }
</script>

<style scoped>

</style>
