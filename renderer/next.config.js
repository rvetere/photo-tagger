const path = require('path')

const resolverOptions = {
  "root": ["."],
  "cwd": "babelrc",
  "alias": {
    "@db": "./src/@db",
    "@config": "./src/@config",
    "@decorators": "./src/@decorators",
    "@core": "./src/@core",
    "@sites": "./src/@sites",
    "@lang": "./src/@lang",
    "@showcase": "./src/@showcase"
  }
}

const internalNodeModulesRegExp = /src(?!\/(?!.*js))/

module.exports = {
  webpack(config, { defaultLoaders, dev }) {
    // Allows you to load Electron modules and
    // native Node.js ones into your renderer
    config.target = 'electron-renderer'

    config.resolve.alias['@core'] = path.resolve(__dirname, 'src', '@core')

    // Inject babel plugins, especially for our module-resolver and styled-jsx
    defaultLoaders.babel.options.plugins = [
      ['module-resolver', resolverOptions],
      ['styled-jsx/babel', { 'optimizeForSpeed': true }],
      ['react-intl', { 'messagesDir': 'src/@lang/.messages/' }]
    ]

    // As soon as we inject babel plugins, we have to add this rule otherwise JSX is suddenly unsupported oO
    config.module.rules.push({
      test: /\.+(js|jsx)$/,
      use: defaultLoaders.babel,
      include: [internalNodeModulesRegExp],
    })

    // Get aliases from resolver options
    for (const key of Object.keys(resolverOptions.alias)) {
      config.resolve.alias[key] = path.resolve(__dirname, resolverOptions.alias[key])
    }

    return config
  },
  exportPathMap() {
    // Let Next.js know where to find the entry page
    // when it's exporting the static bundle for the use
    // in the production version of your app
    return {
      '/start': { page: '/start' }
    }
  }
}

