/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
// !process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

// import path from 'path';
// import loaderUtils from 'loader-utils';

const path = require("path");
const loaderUtils = require("loader-utils");

const regexEqual = (x, y) => {
  return (
    x instanceof RegExp &&
    y instanceof RegExp &&
    x.source === y.source &&
    x.global === y.global &&
    x.ignoreCase === y.ignoreCase &&
    x.multiline === y.multiline
  );
};

/**
 * Generate context-aware class names when developing locally.
 */
const localIdent = (loaderContext, localIdentName, localName, options) => {
  return (
    loaderUtils
      .interpolateName(
        loaderContext,
        btoa(decodeURI(encodeURIComponent(localName))),
        options
      )
      // Webpack name interpolation returns `about_about.module__root` for
      // `.root {}` inside a file named `about/about.module.css`. Let's simplify
      // this.
      .replace(/\.module_/, "_")
      // Replace invalid symbols with underscores instead of escaping
      // https://mathiasbynens.be/notes/css-escapes#identifiers-strings
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      // "they cannot start with a digit, two hyphens, or a hyphen followed by a digit [sic]"
      // https://www.w3.org/TR/CSS21/syndata.html#characters
      .replace(/^(\d|--|-\d)/, "__$1")
  );
};

function cssLoaderOptions(modules) {
  const { getLocalIdent, ...others } = modules; // Need to delete getLocalIdent else localIdentName doesn't work
  return {
    ...others,
    getLocalIdent: localIdent,
    mode: "local",
  };
}

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: false,
  swcMinify: true,
  i18n: {
    locales: ["en", "id"],
    defaultLocale: "en",
  },
  distDir: "build",
  webpack(config, { buildId, dev, isServer, defaultLoaders, webpack }) {
    config.resolve.modules.push(path.resolve("./"));
    const oneOf = config.module.rules.find(
      (rule) => typeof rule.oneOf === "object"
    );

    if (oneOf) {
      // Find the module which targets *.scss|*.sass files
      const moduleSassRule = oneOf.oneOf.find(
        (rule) => regexEqual(rule.test, /\.module\.css$/) //highlight-line
      );

      if (moduleSassRule) {
        // Get the config object for css-loader plugin
        const cssLoader = moduleSassRule.use.find(
          ({ loader }) => loader.includes("css-loader") //highlight-line
        );

        if (cssLoader) {
          cssLoader.options = {
            ...cssLoader.options,
            modules: cssLoaderOptions(cssLoader.options.modules), //highlight-line
          };
        }
      }
    }

    return config;
  },
};
// export default config;
module.exports = config;
