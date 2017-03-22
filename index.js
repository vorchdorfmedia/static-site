const metalsmith = require('metalsmith');
const fs = require('fs');
const path = require('path');
const TarGz = require('tar.gz');
const yaml = require('js-yaml');

const tar = new TarGz({}, {
  level: 9,
  memLevel: 9,
  fromBase: true,
});
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
      if (entry === 'global' || entry === 'ignore' || entry === 'exclude') {
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
  .metadata(config.global.metadata)
  .source(config.global.source)
  .destination(config.global.destination);

  if (config.ignore || config.exclude) {
    let ignoreList = [];
    if (Array.isArray(config.ignore)) {
      ignoreList = config.ignore;
    } else if (Array.isArray(config.exclude)) {
      ignoreList = config.exclude;
    }
    metal.ignore(ignoreList);
  }

  const result = setup(metal, modules);
  return result;
})
.then(metal => new Promise((resolve, reject) => metal.build((err) => {
  if (err) {
    return reject(err.message || err);
  }
  console.log('Build complete');
  return resolve(path.resolve(__dirname, config.global.destination));
})))
.then(cwd => tar.compress(cwd, path.resolve(__dirname, 'webroot.tar.gz')))
.then(() => console.log('Successfully created webroot.tar.gz'))
.catch((e) => {
  console.error(`Error:\n=========\n\n${e.message || e}`);
});

module.exports = init;

init();
