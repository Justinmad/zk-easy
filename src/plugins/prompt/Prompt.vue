<template>
  <div>
    <v-snackbar top v-model="alert.value" :color="alert.color" :timeout="alert.timeout">
      {{alert.message}}
      <v-btn
        icon
        @click="alert.value = false"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
    <v-dialog v-model="confirmModel.value" max-width="500">
      <v-card>
        <v-toolbar color="success" flat dense>
          {{confirmModel.title}}
        </v-toolbar>
        <v-divider></v-divider>
        <div class="pl-1 ma-3"><b>{{confirmModel.message}}</b></div>
        <v-divider></v-divider>
        <v-card-actions>
          <v-checkbox
            v-if="confirmModel.checkbox" class="pa-0 mb-4 ml-2"
            hide-details
            color="red"
            v-model="confirmModel.checkbox.check"
            :label="confirmModel.checkbox.desc"
          ></v-checkbox>
          <v-spacer></v-spacer>
          <v-btn text color="cyan darken-2" @click="confirmModel.value = false">
            Cancel
          </v-btn>
          <v-divider vertical></v-divider>
          <v-btn text @click="doAccept" color="success">
            Accept
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    name: "Prompt",
    data: () => ({
      alert: {},
      confirmModel: {}
    }),
    methods: {
      _alert(config, color) {
        this.alert = {
          value: true,
          timeout: config.timeout || 5000,
          color: color || config.color || 'info',
          message: typeof config === 'string' ? config : (config.message || 'this is an alert')
        }
      },
      confirm(configOrMsg, cb) {
        let callback = cb || configOrMsg.callback
        let message = typeof configOrMsg === 'string' ? configOrMsg : configOrMsg.message
        let checkbox = configOrMsg.checkbox && {
          check: false,
          desc: configOrMsg.checkbox
        }
        this.confirmModel = {
          value: true,
          color: configOrMsg.color || 'success',
          title: configOrMsg.title || 'Confirm',
          message: message || 'this is a confirm',
          checkbox: checkbox,
          callback: typeof callback === 'function' ? callback : (() => {
          })
        }
      },
      async doAccept() {
        await this.confirmModel.callback(this.confirmModel.checkbox && this.confirmModel.checkbox.check)
        this.confirmModel.value = false
      }
    }
  }
</script>

<style scoped>

</style>
