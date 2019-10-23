import {Uint64BE} from "int64-buffer";

export const pause = ms => new Promise(resolve => setTimeout(resolve, ms))

export function parseStat(stat) {
  let result = {}
  stat.specification.forEach(spec => {
    let name = spec.name;
    let type = spec.type;
    let value = stat[name];
    if (name.includes('time') && Buffer.isBuffer(value)) {
      let s = new Uint64BE(value).toNumber();
      result[name] = new Date(s).toLocaleString()
    } else if (type === 'int' && Buffer.isBuffer(value)) {
      result[name] = value.readUInt32LE(0)
    } else if (type === 'long' && Buffer.isBuffer(value)) {
      result[name] = new Uint64BE(value).toString()
    } else {
      result[name] = value
    }
  })
  return result
}
