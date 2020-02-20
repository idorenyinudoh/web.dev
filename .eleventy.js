/*
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItAttrs = require('markdown-it-attrs');
const slugify = require('slugify');

const componentsDir = 'src/site/_includes/components';
const ArticleNavigation = require(`./${componentsDir}/ArticleNavigation`);
const Aside = require(`./${componentsDir}/Aside`);
const Assessment = require(`./${componentsDir}/Assessment`);
const AssessmentResponse = require(`./${componentsDir}/AssessmentResponse`);
const Author = require(`./${componentsDir}/Author`);
const AuthorInfo = require(`./${componentsDir}/AuthorInfo`);
const Banner = require(`./${componentsDir}/Banner`);
const Block = require(`./${componentsDir}/Block`);
const Blockquote = require(`./${componentsDir}/Blockquote`);
const Breadcrumbs = require(`./${componentsDir}/Breadcrumbs`);
const CodelabsCallout = require(`./${componentsDir}/CodelabsCallout`);
const Compare = require(`./${componentsDir}/Compare`);
const CompareCaption = require(`./${componentsDir}/CompareCaption`);
const Details = require(`./${componentsDir}/Details`);
const DetailsSummary = require(`./${componentsDir}/DetailsSummary`);
const Hero = require(`./${componentsDir}/Hero`);
const Instruction = require(`./${componentsDir}/Instruction`);
const Meta = require(`./${componentsDir}/Meta`);
const PathCard = require(`./${componentsDir}/PathCard`);
const PostCard = require(`./${componentsDir}/PostCard`);
const Tooltip = require(`./${componentsDir}/Tooltip`);
const YouTube = require(`./${componentsDir}/YouTube`);

const tagsDir = 'src/site/_includes/components/tags';
const {Image, Figure} = require(`./${tagsDir}/Image`);

const collectionsDir = 'src/site/_collections';
const postDescending = require(`./${collectionsDir}/post-descending`);
const postsWithLighthouse = require(`./${collectionsDir}/posts-with-lighthouse`);
const recentPosts = require(`./${collectionsDir}/recent-posts`);
// nb. algoliaPosts is only require'd if needed, below

const filtersDir = 'src/site/_filters';
const {memoize, findBySlug} = require(`./${filtersDir}/find-by-slug`);
const pathSlug = require(`./${filtersDir}/path-slug`);
const containsTag = require(`./${filtersDir}/contains-tag`);
const expandContributors = require(`./${filtersDir}/expand-contributors`);
const githubLink = require(`./${filtersDir}/github-link`);
const htmlDateString = require(`./${filtersDir}/html-date-string`);
const md = require(`./${filtersDir}/md`);
const paginate = require(`./${filtersDir}/paginate`);
const postsLighthouseJson = require(`./${filtersDir}/posts-lighthouse-json`);
const prettyDate = require(`./${filtersDir}/pretty-date`);
const removeDrafts = require(`./${filtersDir}/remove-drafts`);
const stripBlog = require(`./${filtersDir}/strip-blog`);
const stripLanguage = require(`./${filtersDir}/strip-language`);

module.exports = function(config) {
  //----------------------------------------------------------------------------
  // PLUGINS
  //----------------------------------------------------------------------------
  // Syntax highlighting for code snippets
  config.addPlugin(pluginSyntaxHighlight);
  // RSS feeds
  config.addPlugin(pluginRss);

  //----------------------------------------------------------------------------
  // MARKDOWN
  //----------------------------------------------------------------------------
  const markdownItOptions = {
    html: true,
  };
  const markdownItAnchorOptions = {
    level: 2,
    permalink: true,
    permalinkClass: 'w-headline-link',
    permalinkSymbol: '#',
    slugify: function(str) {
      return slugify(str, {
        replacement: '-',
        lower: true,
      });
    },
  };
  const markdownItAttrsOpts = {
    leftDelimiter: '{:',
    rightDelimiter: '}',
    allowedAttributes: ['id', 'class', /^data\-.*$/],
  };

  const mdLib = markdownIt(markdownItOptions)
    .use(markdownItAnchor, markdownItAnchorOptions)
    .use(markdownItAttrs, markdownItAttrsOpts);

  // custom renderer rules
  const fence = mdLib.renderer.rules.fence;

  const rules = {
    fence: (tokens, idx, options, env, slf) => {
      const fenced = fence(tokens, idx, options, env, slf);
      return `<web-copy-code>${fenced}</web-copy-code>`;
    },
    table_close: () => '</table>\n</div>',
    table_open: () => '<div class="w-table-wrapper">\n<table>\n',
  }

  mdLib.renderer.rules = {...mdLib.renderer.rules, ...rules};

  config.setLibrary(
    'md',
    mdLib
  );

  //----------------------------------------------------------------------------
  // COLLECTIONS
  //----------------------------------------------------------------------------
  config.addCollection('posts', postDescending);
  config.addCollection('postsWithLighthouse', postsWithLighthouse);
  config.addCollection('recentPosts', recentPosts);
  // Turn collection.all into a lookup table so we can use findBySlug
  // to quickly find collection items without looping.
  config.addCollection('memoized', function(collection) {
    return memoize(collection.getAll());
  });
  config.addCollection('algolia', function(collection) {
    if (process.env.ELEVENTY_ENV === 'prod') {
      const algoliaPosts = require(`./${collectionsDir}/algolia-posts`);
      return algoliaPosts(collection);
    }
    return [];
  });

  //----------------------------------------------------------------------------
  // FILTERS
  //----------------------------------------------------------------------------
  config.addFilter('findBySlug', findBySlug);
  config.addFilter('pathSlug', pathSlug);
  config.addFilter('containsTag', containsTag);
  config.addFilter('expandContributors', expandContributors);
  config.addFilter('githubLink', githubLink);
  config.addFilter('htmlDateString', htmlDateString);
  config.addFilter('md', md);
  config.addFilter('paginate', paginate);
  config.addFilter('postsLighthouseJson', postsLighthouseJson);
  config.addFilter('prettyDate', prettyDate);
  config.addFilter('removeDrafts', removeDrafts);
  config.addFilter('stripBlog', stripBlog);
  config.addFilter('stripLanguage', stripLanguage);

  //----------------------------------------------------------------------------
  // SHORTCODES
  //----------------------------------------------------------------------------
  config.addShortcode('ArticleNavigation', ArticleNavigation);
  config.addPairedShortcode('Aside', Aside);
  config.addShortcode('Assessment', Assessment);
  config.addPairedShortcode('AssessmentResponse', AssessmentResponse);
  config.addShortcode('Author', Author);
  config.addShortcode('AuthorInfo', AuthorInfo);
  config.addPairedShortcode('Banner', Banner);
  config.addPairedShortcode('Block', Block);
  config.addPairedShortcode('Blockquote', Blockquote);
  config.addShortcode('Breadcrumbs', Breadcrumbs);
  config.addShortcode('CodelabsCallout', CodelabsCallout);
  config.addPairedShortcode('Compare', Compare);
  config.addPairedShortcode('CompareCaption', CompareCaption);
  config.addPairedShortcode('Details', Details);
  config.addPairedShortcode('DetailsSummary', DetailsSummary);
  config.addShortcode('Hero', Hero);
  config.addShortcode('Instruction', Instruction);
  config.addShortcode('Meta', Meta);
  config.addShortcode('PathCard', PathCard);
  config.addShortcode('PostCard', PostCard);
  config.addShortcode('Tooltip', Tooltip);
  config.addShortcode('YouTube', YouTube);

  //----------------------------------------------------------------------------
  // CUSTOM TAGS
  //----------------------------------------------------------------------------
  config.addNunjucksTag('Image', Image);
  config.addNunjucksTag('Figure', Figure);

  // https://www.11ty.io/docs/config/#data-deep-merge
  config.setDataDeepMerge(true);

  // https://www.11ty.io/docs/config/#configuration-options
  return {
    dir: {
      input: 'src/site/content',
      output: 'dist',
      data: '../_data',
      includes: '../_includes',
    },
    templateFormats: ['njk', 'md'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    // Because eleventy's passthroughFileCopy does not work with permalinks
    // we need to manually copy assets ourselves using gulp.
    // https://github.com/11ty/eleventy/issues/379
    passthroughFileCopy: false,
  };
};
