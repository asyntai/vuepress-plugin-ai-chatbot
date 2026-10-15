import type { Plugin } from 'vuepress/core';

export interface AiChatbotPluginOptions {
  /** Your Asyntai widget ID, for example `asyntai_1a2b3c4d5e6f`. Required. */
  widgetId: string;
  /** Set to false to keep the widget off the site during `vuepress dev`. */
  enableInDevelopment?: boolean;
  /** Advanced. Load the widget script from another URL. */
  scriptUrl?: string;
}

export declare const aiChatbotPlugin: (options: AiChatbotPluginOptions) => Plugin;
export default aiChatbotPlugin;
