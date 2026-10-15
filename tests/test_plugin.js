/**
 * Offline tests for vuepress-plugin-ai-chatbot.
 *
 * These test the option handling, the head entry and the plugin hook on their
 * own, without a VuePress install, so a mistake shows up in a second.
 *
 * Run: node plugins/vuepress/tests/test_plugin.js
 */

import assert from 'assert';
import {
  DEFAULT_SCRIPT_URL,
  addToHead,
  buildHeadTag,
  buildLoader,
  isAsyntaiTag,
  validateOptions,
} from '../src/loader.js';
import aiChatbotPluginDefault, { aiChatbotPlugin } from '../src/index.js';

const ID = 'asyntai_1a2b3c4d5e6f';
const passed = [];
const failed = [];

function check(name, fn) {
  try {
    fn();
    passed.push(name);
    console.log('  PASS  ' + name);
  } catch (err) {
    failed.push(name);
    console.log('  FAIL  ' + name + '  -> ' + err.message);
  }
}

function tag(options) {
  return buildHeadTag(validateOptions(options));
}

function fakeApp(isDev, head) {
  return { env: { isDev }, siteData: { head } };
}

console.log('\nOptions');

check('a valid widget ID is accepted', () => {
  assert.strictEqual(validateOptions({ widgetId: ID }).widgetId, ID);
});

check('surrounding spaces are trimmed', () => {
  assert.strictEqual(validateOptions({ widgetId: '  ' + ID + '  ' }).widgetId, ID);
});

check('a missing widget ID stops the build', () => {
  assert.throws(() => validateOptions({}), /widgetId" is required/);
});

check('no options at all stops the build', () => {
  assert.throws(() => validateOptions(), /widgetId" is required/);
});

check('an empty widget ID stops the build', () => {
  assert.throws(() => validateOptions({ widgetId: '   ' }), /widgetId" is required/);
});

check('a widget ID without the prefix stops the build', () => {
  assert.throws(() => validateOptions({ widgetId: '1a2b3c4d5e6f' }), /does not look like a widget ID/);
});

check('a widget ID with a quote in it stops the build', () => {
  assert.throws(() => validateOptions({ widgetId: 'asyntai_a"b' }), /does not look like a widget ID/);
});

check('the error names the package', () => {
  assert.throws(() => validateOptions({}), /^Error: vuepress-plugin-ai-chatbot:/);
});

check('the default script URL is the Asyntai CDN', () => {
  assert.strictEqual(
    validateOptions({ widgetId: ID }).scriptUrl,
    'https://widget.asyntai.com/static/js/chat-widget.js',
  );
});

check('a custom script URL is kept', () => {
  assert.strictEqual(
    validateOptions({ widgetId: ID, scriptUrl: 'https://example.com/widget.js' }).scriptUrl,
    'https://example.com/widget.js',
  );
});

check('enableInDevelopment is on unless it is set to false', () => {
  assert.strictEqual(validateOptions({ widgetId: ID }).enableInDevelopment, true);
  assert.strictEqual(
    validateOptions({ widgetId: ID, enableInDevelopment: false }).enableInDevelopment,
    false,
  );
});

console.log('\nHead entry');

check('the entry is a script tag with a marker attribute', () => {
  const entry = tag({ widgetId: ID });
  assert.strictEqual(entry[0], 'script');
  assert.strictEqual(entry[1]['data-asyntai-loader'], true);
});

check('the entry carries code, not a src attribute', () => {
  const entry = tag({ widgetId: ID });
  assert.ok(entry[2]);
  assert.strictEqual(entry[1].src, undefined);
});

check('our own entry is recognised', () => {
  assert.ok(isAsyntaiTag(tag({ widgetId: ID })));
});

check('a hand-made snippet in the config is recognised', () => {
  assert.ok(isAsyntaiTag(['script', { src: DEFAULT_SCRIPT_URL, 'data-asyntai-id': ID }]));
});

check('other head entries are not mistaken for ours', () => {
  assert.ok(!isAsyntaiTag(['link', { rel: 'icon', href: '/favicon.ico' }]));
  assert.ok(!isAsyntaiTag(['script', { src: '/other.js' }]));
  assert.ok(!isAsyntaiTag('script'));
});

check('the entry is added once, even if called twice', () => {
  const head = [['link', { rel: 'icon', href: '/favicon.ico' }]];
  const settings = validateOptions({ widgetId: ID });
  assert.strictEqual(addToHead(head, settings), true);
  assert.strictEqual(addToHead(head, settings), false);
  assert.strictEqual(head.filter(isAsyntaiTag).length, 1);
  assert.strictEqual(head.length, 2);
});

check('a site with its own snippet gets no second one', () => {
  const head = [['script', { src: DEFAULT_SCRIPT_URL, 'data-asyntai-id': ID }]];
  assert.strictEqual(addToHead(head, validateOptions({ widgetId: ID })), false);
  assert.strictEqual(head.length, 1);
});

console.log('\nLoader code');

check('the widget ID is in the loader', () => {
  assert.ok(tag({ widgetId: ID })[2].includes('"' + ID + '"'));
});

check('the script URL is in the loader', () => {
  assert.ok(tag({ widgetId: ID })[2].includes(DEFAULT_SCRIPT_URL));
});

check('the loader waits for the load event', () => {
  const code = tag({ widgetId: ID })[2];
  assert.ok(code.includes('window.addEventListener("load"'));
  assert.ok(code.includes('document.readyState==="complete"'));
});

check('the loader has no closing script tag in it', () => {
  const code = buildLoader(ID, 'https://example.com/a</script><b>.js');
  assert.ok(!code.toLowerCase().includes('</script'));
});

check('the loader is valid JavaScript', () => {
  new Function(tag({ widgetId: ID })[2]);
});

check('the loader adds the widget only once', () => {
  assert.ok(buildLoader(ID, DEFAULT_SCRIPT_URL).includes('document.querySelector("script[data-asyntai-id]")'));
});

console.log('\nPlugin');

check('the plugin is exported by name and as default', () => {
  assert.strictEqual(aiChatbotPluginDefault, aiChatbotPlugin);
});

check('the plugin object has the package name', () => {
  assert.strictEqual(aiChatbotPlugin({ widgetId: ID }).name, 'vuepress-plugin-ai-chatbot');
});

check('a wrong widget ID fails when the config loads', () => {
  assert.throws(() => aiChatbotPlugin({ widgetId: 'nope' }), /does not look like a widget ID/);
});

check('a build gets the loader', () => {
  const app = fakeApp(false, []);
  aiChatbotPlugin({ widgetId: ID }).onInitialized(app);
  assert.strictEqual(app.siteData.head.filter(isAsyntaiTag).length, 1);
});

check('dev gets the loader by default', () => {
  const app = fakeApp(true, []);
  aiChatbotPlugin({ widgetId: ID }).onInitialized(app);
  assert.strictEqual(app.siteData.head.length, 1);
});

check('dev with enableInDevelopment false gets no loader', () => {
  const app = fakeApp(true, []);
  aiChatbotPlugin({ widgetId: ID, enableInDevelopment: false }).onInitialized(app);
  assert.strictEqual(app.siteData.head.length, 0);
});

check('a build with enableInDevelopment false still gets the loader', () => {
  const app = fakeApp(false, []);
  aiChatbotPlugin({ widgetId: ID, enableInDevelopment: false }).onInitialized(app);
  assert.strictEqual(app.siteData.head.length, 1);
});

check('a missing head list is created', () => {
  const app = fakeApp(false, undefined);
  aiChatbotPlugin({ widgetId: ID }).onInitialized(app);
  assert.strictEqual(app.siteData.head.length, 1);
});

console.log('\n' + passed.length + ' passed, ' + failed.length + ' failed\n');
process.exit(failed.length === 0 ? 0 : 1);
