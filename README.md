# vuepress-plugin-ai-chatbot

Add the [Asyntai](https://asyntai.com) AI chat assistant to your VuePress site.
It answers visitor questions from your own documentation, in more than 80
languages.

## Install

```bash
npm install -D vuepress-plugin-ai-chatbot
```

Then add the plugin in `.vuepress/config.js` (or `config.ts`):

```js
import { defineUserConfig } from 'vuepress';
import { aiChatbotPlugin } from 'vuepress-plugin-ai-chatbot';

export default defineUserConfig({
  plugins: [
    aiChatbotPlugin({ widgetId: 'asyntai_1a2b3c4d5e6f' }),
  ],
});
```

Build the site. The chat bubble is on every page.

## Where the widget ID comes from

Open the Install page in your [Asyntai dashboard](https://asyntai.com/dashboard).
The widget ID is the value of `data-asyntai-id` in the snippet shown there. It
starts with `asyntai_`.

Creating an account is free, and the Free plan is enough to try the widget.

## Options

| Option | Type | Default | What it does |
| --- | --- | --- | --- |
| `widgetId` | string | required | Your Asyntai widget ID |
| `enableInDevelopment` | boolean | `true` | Set to `false` to keep the widget off the site during `vuepress dev` |
| `scriptUrl` | string | the Asyntai CDN | Advanced. Load the widget from another URL |

A missing or malformed `widgetId` stops the build with a message that says how
to fix it.

## What the plugin does

- It adds the Asyntai loader to the head of every page.
- The loader waits for the page's `load` event, so your own content always
  renders first.
- It works with the default theme and with any other theme, and the chat stays
  open while the visitor moves between pages.
- If your `head` config already has an Asyntai snippet, the plugin adds no
  second one.

## Answering from your content

Asyntai reads your published pages. Add your site URL in the dashboard, and the
assistant answers from the same pages the widget sits on. You can also add extra
documents and question and answer pairs.

## VuePress versions

VuePress 2. Both `vuepress build` and `vuepress dev` put the widget on every
page.

## TypeScript

Types ship with the package.

## Removing it

Delete the `aiChatbotPlugin` line from the config and build again. The widget is
gone.

## Support

Email [hello@asyntai.com](mailto:hello@asyntai.com), or read the
[VuePress guide](https://asyntai.com/documentation/integrations/vuepress/).

## Licence

MIT. See [LICENSE](LICENSE).
