/**
 * Option handling and the embed snippet for vuepress-plugin-ai-chatbot.
 *
 * This file has no dependencies, so the tests run it on its own, without a
 * VuePress install.
 */

export const DEFAULT_SCRIPT_URL = 'https://widget.asyntai.com/static/js/chat-widget.js';
export const NAME = 'vuepress-plugin-ai-chatbot';

const WIDGET_ID_PATTERN = /^asyntai_[A-Za-z0-9]+$/;

/**
 * VuePress calls the plugin before it builds anything, so a wrong option stops
 * the build with a clear message instead of producing a site with no chat on it.
 */
export function validateOptions(options) {
  const opts = options || {};
  const widgetId = typeof opts.widgetId === 'string' ? opts.widgetId.trim() : '';

  if (!widgetId) {
    throw new Error(
      NAME +
        ': "widgetId" is required. Copy it from the Install page of your ' +
        'Asyntai dashboard, for example asyntai_1a2b3c4d5e6f.',
    );
  }
  if (!WIDGET_ID_PATTERN.test(widgetId)) {
    throw new Error(
      NAME +
        ': "' +
        widgetId +
        '" does not look like a widget ID. It starts with asyntai_, for ' +
        'example asyntai_1a2b3c4d5e6f.',
    );
  }

  const scriptUrl =
    typeof opts.scriptUrl === 'string' && opts.scriptUrl.trim()
      ? opts.scriptUrl.trim()
      : DEFAULT_SCRIPT_URL;

  return {
    widgetId,
    scriptUrl,
    // Set to false to keep the widget off the site during `vuepress dev`.
    enableInDevelopment: opts.enableInDevelopment !== false,
  };
}

/** JSON.stringify, safe inside an HTML <script> element. */
function jsString(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/**
 * The loader waits for the page's load event before it fetches the widget.
 * An ordinary `<script async src>` holds the load event open until its own
 * fetch finishes, so an unreachable server would delay the host page. This
 * pattern cannot.
 */
export function buildLoader(widgetId, scriptUrl) {
  return (
    '(function(){var l=function(){' +
    'if(document.querySelector("script[data-asyntai-id]"))return;' +
    'var s=document.createElement("script");' +
    's.src=' +
    jsString(scriptUrl) +
    ';s.async=true;' +
    's.setAttribute("data-asyntai-id",' +
    jsString(widgetId) +
    ');' +
    'document.head.appendChild(s)};' +
    'if(document.readyState==="complete"){l()}' +
    'else{window.addEventListener("load",l)}})();'
  );
}

/** The VuePress head entry: [tag, attributes, inner code]. */
export function buildHeadTag(settings) {
  return [
    'script',
    { 'data-asyntai-loader': true },
    buildLoader(settings.widgetId, settings.scriptUrl),
  ];
}

/** True for a head entry this plugin (or a hand-made snippet) already added. */
export function isAsyntaiTag(entry) {
  if (!Array.isArray(entry) || entry[0] !== 'script') {
    return false;
  }
  const attrs = entry[1] || {};
  return 'data-asyntai-loader' in attrs || 'data-asyntai-id' in attrs;
}

/** Adds the loader to the site head once. Returns true when it added it. */
export function addToHead(head, settings) {
  if (head.some(isAsyntaiTag)) {
    return false;
  }
  head.push(buildHeadTag(settings));
  return true;
}
