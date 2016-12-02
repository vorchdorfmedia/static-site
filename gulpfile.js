const gulp = require('gulp');
const fs = require('fs');
const yaml = require('js-yaml');
const Promise = require('bluebird');

const metalsmith = require('metalsmith');
const collections = require('metalsmith-collections');
const fileDate = require('metalsmith-date-in-filename');
const layouts = require('metalsmith-layouts');
const markdown = require('metalsmith-markdown');
const permalinks = require('metalsmith-permalinks');

Promise.promisifyAll(fs);

gulp.task('default', () => fs.readFileAsync('./_config.yml')
.then(config => yaml.safeLoad(config))
.then(config => metalsmith(__dirname)
  .metadata(config.meta)
  .source(config.global.source)
  .destination(config.global.destination)
  .clean(true)
  .use(markdown())
  .use(layouts(config.layouts))
  .use(fileDate(true))
  .use(collections(config.collections))
  .use(permalinks(config.permalinks))
  .build((err) => {
    if (err) {
      return Promise.reject(err);
    }
    return true;
  }))
.catch((e) => {
  throw new Error(e);
}));
