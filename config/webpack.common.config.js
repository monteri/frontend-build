const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function getOverrides() {
  const currentMfe = path.basename(process.cwd())
  const overridesPath = path.resolve(__dirname, `../overrides/${currentMfe}`);
  const overrides = [];

  function processDirectory(directory) {
    const objects = fs.readdirSync(directory);

    objects.forEach((object) => {
      const objectPath = path.join(directory, object);
      const stats = fs.statSync(objectPath);

      if (stats.isDirectory()) {
        const relativePath = path.relative(overridesPath, objectPath);
        const originalPath = path.join(process.cwd(), relativePath);
        overrides.push({
          from: objectPath,
          to: originalPath,
        })
        processDirectory(objectPath);
      }
    });
  }

  processDirectory(overridesPath);
  console.log('overrides', overrides);
  return overrides;
}

module.exports = {
  entry: {
    app: path.resolve(process.cwd(), './src/index'),
  },
  output: {
    path: path.resolve(process.cwd(), './dist'),
    publicPath: '/',
  },
  resolve: {
    alias: {
      'env.config': path.resolve(process.cwd(), './env.config'),
    },
    fallback: {
      // This causes the system to return an empty object if it can't find an env.config.js file in
      // the application being built.
      'env.config': false,
    },
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        new webpack.NormalModuleReplacementPlugin(
          ...getOverrides().map(({ originalModule, replacement }) => ({
            resourceRegExp: new RegExp(originalModule),
            newResource: replacement,
          }))
        ),
      ],
    }),
  ],
};
