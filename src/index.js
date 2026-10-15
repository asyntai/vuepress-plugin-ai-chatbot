/**
 * Asyntai AI chatbot for VuePress 2.
 *
 * Adds the Asyntai chat widget to every page of the site. VuePress owns the
 * HTML of each page, so the plugin adds the ordinary embed loader to the site
 * head and changes nothing else about the site.
 */

import { NAME, addToHead, validateOptions } from './loader.js';

export const aiChatbotPlugin = (options) => {
  const settings = validateOptions(options);

  return {
    name: NAME,

    onInitialized(app) {
      if (app.env.isDev && !settings.enableInDevelopment) {
        return;
      }
      app.siteData.head = app.siteData.head || [];
      addToHead(app.siteData.head, settings);
    },
  };
};

export default aiChatbotPlugin;
