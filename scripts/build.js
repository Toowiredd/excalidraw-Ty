const path = require("path");
const { build } = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");
const { woff2ServerPlugin } = require("./woff2/woff2-esbuild-plugins");
const { parseEnvVariables } = require("../packages/excalidraw/env.cjs");

const ENV_VARS = {
  development: {
    ...parseEnvVariables(`${__dirname}/../.env.development`),
    DEV: true,
  },
  production: {
    ...parseEnvVariables(`${__dirname}/../.env.production`),
    PROD: true,
  },
};

const getConfig = (outdir, isPackage) => ({
  outdir,
  bundle: true,
  format: "esm",
  entryPoints: isPackage
    ? ["index.tsx", "**/*.chunk.ts"]
    : ["src/index.ts"],
  entryNames: "[name]",
  assetNames: "[dir]/[name]",
  alias: {
    "@excalidraw/common": path.resolve(__dirname, "../packages/common/src"),
    "@excalidraw/element": path.resolve(__dirname, "../packages/element/src"),
    "@excalidraw/excalidraw": path.resolve(__dirname, "../packages/excalidraw"),
    "@excalidraw/math": path.resolve(__dirname, "../packages/math/src"),
    "@excalidraw/utils": path.resolve(__dirname, "../packages/utils/src"),
  },
  loader: {
    ".woff2": "file",
  },
});

function buildDev(config) {
  return build({
    ...config,
    sourcemap: true,
    plugins: [sassPlugin(), woff2ServerPlugin()],
    define: {
      "import.meta.env": JSON.stringify(ENV_VARS.development),
    },
  });
}

function buildProd(config) {
  return build({
    ...config,
    minify: true,
    plugins: [
      sassPlugin(),
      woff2ServerPlugin({
        outdir: `${config.outdir}/assets`,
      }),
    ],
    define: {
      "import.meta.env": JSON.stringify(ENV_VARS.production),
    },
  });
}

const createESMRawBuild = async (isPackage) => {
  const chunksConfig = isPackage
    ? {
        entryPoints: ["index.tsx", "**/*.chunk.ts"],
        entryNames: "[name]",
      }
    : {};

  // development unminified build with source maps
  await buildDev({
    ...getConfig("dist/dev", isPackage),
    ...chunksConfig,
  });

  // production minified build without sourcemaps
  await buildProd({
    ...getConfig("dist/prod", isPackage),
    ...chunksConfig,
  });
};

(async () => {
  await createESMRawBuild(true); // Build package
  await createESMRawBuild(false); // Build utils
})();
