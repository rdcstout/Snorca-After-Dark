'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const defaults = Object.freeze({appPath:'',autoOpen:false,automaticUpdates:true,lastUpdateAttempt:0,dismissedUpdate:''});
function validateSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      typeof value.appPath !== 'string' || typeof value.autoOpen !== 'boolean') {
    throw new Error('Saved settings are invalid. Automatic launch is disabled; choose Orca again.');
  }
  const automaticUpdates=value.automaticUpdates??true,lastUpdateAttempt=value.lastUpdateAttempt??0,dismissedUpdate=value.dismissedUpdate??'';
  if(typeof automaticUpdates!=='boolean'||!Number.isFinite(lastUpdateAttempt)||lastUpdateAttempt<0||typeof dismissedUpdate!=='string')throw Error('Saved update settings are invalid.');
  return {appPath:value.appPath,autoOpen:value.autoOpen,automaticUpdates,lastUpdateAttempt,dismissedUpdate};
}
class SettingsStore {
  constructor(folder) { this.folder = folder; this.value = {...defaults}; this.queue = Promise.resolve(); }
  async load() {
    try { this.value = validateSettings(JSON.parse(await fs.readFile(path.join(this.folder, 'settings.json'), 'utf8'))); }
    catch (error) {
      if (error.code === 'ENOENT') return '';
      // Preserve the invalid original before any later save, without exposing its contents.
      await fs.mkdir(this.folder, {recursive: true});
      await fs.copyFile(path.join(this.folder, 'settings.json'), path.join(this.folder, 'settings.invalid-' + Date.now() + '.json'));
      this.value = {...defaults};
      return 'Saved settings could not be read. A copy was preserved. Choose Orca again; automatic launch is off.';
    }
    return '';
  }
  update(changes) {
    const operation = this.queue.then(async () => {
      const next = validateSettings({...this.value, ...changes});
      await fs.mkdir(this.folder, {recursive: true});
      const temporary = path.join(this.folder, 'settings-' + crypto.randomUUID() + '.tmp');
      try {
        await fs.writeFile(temporary, JSON.stringify(next), {mode: 0o600, flag: 'wx'});
        await fs.rename(temporary, path.join(this.folder, 'settings.json'));
        this.value = next;
      } finally { await fs.rm(temporary, {force: true}); }
      return this.value;
    });
    this.queue = operation.catch(() => {});
    return operation;
  }
}
class OperationGate {
  busy = false;
  async run(operation) {
    if (this.busy) throw new Error('An operation is already running. Wait for it to finish.');
    this.busy = true;
    try { return await operation(); } finally { this.busy = false; }
  }
}
class Diagnostics {
  constructor(folder) { this.folder = folder; this.queue = Promise.resolve(); }
  write(event, code = '') {
    // Intentionally exclude error messages, paths, account data, and printer information.
    const line = JSON.stringify({time: new Date().toISOString(), event: String(event).replace(/[^a-zA-Z0-9_.-]/g, '').slice(0,64), code: String(code).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,32)}) + '\n';
    const operation = this.queue.then(async () => {
      await fs.mkdir(this.folder, {recursive: true});
      const file = path.join(this.folder, 'diagnostics.log');
      const size = await fs.stat(file).then(s => s.size).catch(() => 0);
      if (size > 64 * 1024) { await fs.rm(file + '.1', {force:true}); await fs.rename(file, file + '.1'); }
      await fs.appendFile(file, line, {mode:0o600});
    });
    this.queue = operation.catch(() => {});
    return this.queue;
  }
}
module.exports = {SettingsStore, OperationGate, Diagnostics, validateSettings};
