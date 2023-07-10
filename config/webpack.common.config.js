const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function getOverrides() {
  const currentMfe = path.basename(process.cwd())
  const overridesPath = path.resolve(__dirname, `../overrides/${currentMfe}`);
  const overrides = [];

  function processDirectory(directory) {
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        const relativePath = path.relative(overridesPath, filePath);
        const originalPath = path.join(process.cwd(), relativePath);
        overrides.push({
          from: filePath,
          to: originalPath,
        })
      } else if (stats.isDirectory()) {
        processDirectory(filePath); // Recursively process subdirectories
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
        ...getOverrides()
      ],
    }),
  ],
};
