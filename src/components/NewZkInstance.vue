<template>
  <v-dialog
    v-model="dialog"
    width="500"
    persistent
  >
    <template v-slot:activator="{ on }">
      <v-btn block text v-on="on">
        <v-icon>mdi-plus</v-icon>
        create
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">{{title}} Instance</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="zkForm"
                v-model="valid">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Host" v-model="edit.host" persistent-hint
                              :placeholder="defaultHost"
                              hint="Default is localhost"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Title" v-model="edit.title" persistent-hint :error-messages="errMsg"
                              :placeholder="edit.host"
                              hint="Default is host name"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Port" v-model="edit.port" type="number" :rules="rules" persistent-hint
                              :placeholder="defaultPort"
                              hint="Default is 2181"></v-text-field>
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
          @click="doClose"
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
  import ZkConnectionWrapper, {DefaultHost, DefaultPort} from "../scripts/ZkConnectionWrapper"

  export default {
    name: "NewZkInstance",
    data: () => ({
      title: '',
      valid: false,
      rules: [
        v => !v || (v > 0 && v <= 65535) || 'invalid port'
      ],
      errMsg: null,
      defaultHost: DefaultHost,
      defaultPort: DefaultPort.toString(),
      edit: {}
    }),
    methods: {
      doSave() {
        if (this.$refs.zkForm.validate()) {
          this.edit.host = this.edit.host || DefaultHost
          this.edit.port = this.edit.port || DefaultPort
          this.edit.title = this.edit.title || `${this.edit.host}:${this.edit.port}`
          if (this.existsTitle()) {
            this.errMsg = `名称${this.edit.title}已存在`
            return
          }
          if (this.edit instanceof ZkConnectionWrapper) {
            this.$emit("input", this.edit)
          } else {
            this.$emit("create", this.edit)
          }
          this.doClose();
        }
      },
      existsTitle() {
        let title = this.edit.title;
        for (let instance of this.exists) {
          if (instance.title === title && instance !== this.value) {
            return true
          }
        }
        return false
      },
      doClose() {
        this.dialog = false
        this.errMsg = null
      }
    },
    computed: {
      dialog: {
        get() {
          return this.value != null
        },
        set(newVal) {
          if (newVal) {
            this.$emit("input", {})
          } else {
            this.$emit("input", null)
          }
        }
      }
    },
    watch: {
      value(newVal) {
        if (newVal) {
          this.edit = {...newVal}
        }
      }
    },
    props: [
      'exists',
      'value',
    ]
  }
</script>

<style scoped>

</style>
