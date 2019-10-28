<template>
  <v-simple-table dense>
    <template v-slot:default>
      <thead>
      <tr>
        <th class="text-center">Name</th>
        <th class="text-center">Value</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in Object.keys(data)" :key="item.name">
        <td>{{ item }}</td>
        <td>{{ data[item] }}</td>
      </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
  export default {
    name: "ObjectIterator",
    props: ['data']
  }
</script>

<style scoped>

</style>
