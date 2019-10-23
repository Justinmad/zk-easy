const fs = require('fs')
const asyncFs = fs.promises

const Electron = require('electron').remote.app
const userData = Electron.getPath("userData")
const configPath = `${userData}/zkConnections.json`

export function load() {
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (_) {
    return []
  }
}

export function loadAsync() {
  return asyncFs.readFile(configPath)
    .catch(err => {
      if (err) throw err;
    })
}

export function update(config) {
  let data = JSON.stringify(config, null, 2)
  fs.writeFileSync(configPath, data)
}
