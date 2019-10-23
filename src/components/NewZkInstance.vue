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
        <v-form v-if="value" ref="zkForm"
                v-model="valid">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Host" v-model="value.host" persistent-hint
                              :placeholder="defaultHost"
                              hint="Default is localhost"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Title" v-model="value.title" persistent-hint :error-messages="errMsg"
                              :placeholder="value.host"
                              hint="Default is host name"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Port" v-model="value.port" type="number" :rules="rules" persistent-hint
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
  import {default as ZkConnection, DefaultHost, DefaultPort} from "../scripts/ZkConnectionWrapper"

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
      defaultPort: DefaultPort.toString()
    }),
    methods: {
      doSave() {
        if (this.$refs.zkForm.validate()) {
          this.value.host = this.value.host || DefaultHost
          this.value.port = this.value.port || DefaultPort
          this.value.title = this.value.title || `${this.value.host}:${this.value.port}`
          if (!(this.value instanceof ZkConnection) && this.exists.has(this.value.title)) {
            this.errMsg = `名称${this.value.title}已存在`
            return
          }
          this.$emit("create", this.value)
          this.doClose();
        }
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
    props: {
      exists: Set,
      value: Object,
    }
  }
</script>

<style scoped>

</style>
