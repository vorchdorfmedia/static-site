const metalsmith = require('metalsmith');
const fs = require('fs');
const yaml = require('js-yaml');

let config = {};
let iterator = 0;

const parseConfig = (name) => {
  config = fs.readFileSync(`./${name}`);
  if (name.endsWith('.js') || name.endsWith('.json')) {
    return JSON.parse(config);
  }

  try {
    config = yaml.safeLoad(config, 'utf8');
    if (config !== null && typeof config !== 'object') {
      config = JSON.parse(config);
    }
  } catch (e) {
    console.error('No valid config file found!');
    config = null;
  }
  return config;
};

const loadDeps = obj => new Promise((resolve, reject) => {
  if (obj !== null && typeof obj === 'object') {
    const module = {};
    Object.keys(obj).forEach((entry) => {
      if (entry === 'global' || entry === 'meta') {
        return;
      }

      try {
        module[entry] = require(`metalsmith-${entry}`);
      } catch (e) {
        reject(e.message || e);
      }
    });
    return resolve(module);
  }
  return reject('Config object is null!');
});

const setup = (metal, modules) => {
  const keys = Object.keys(modules);
  if (iterator < keys.length) {
    const name = keys[iterator];
    const mod = modules[name];
    const modConfig = config[name];
    const tmp = metal.use(mod(modConfig));
    iterator += 1;
    return setup(tmp, modules);
  }
  return metal;
};

const init = () => new Promise((resolve, reject) => {
  const result = parseConfig('_config.yml');
  if (result === null) {
    return reject('Config parsing failed!');
  }
  return resolve(config);
})
.then(loadDeps)
.then((modules) => {
  const metal = metalsmith('./')
  .metadata(config.metadata)
  .source(config.global.source)
  .destination(config.global.destination);

  const result = setup(metal, modules);
  return result;
})
.then(metal => {
  console.log(metal);
  return metal.build((err) => {
    if (err) {
      return Promise.reject(err.message || err);
    }
    console.log('Build complete');
  });
})
.catch((e) => {
  console.error(`Error:\n=========\n\n${e.message || e}`);
});

module.exports = init;

init();
