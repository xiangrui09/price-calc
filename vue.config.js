const path = require('path');
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
    return path.join(__dirname, dir);
}

const environment = process.env.NODE_ENV || 'development'
const envConfig = require(`./config/${environment}.js`)

// 从设置中获取页面标题
const name = envConfig.publicName || defaultSettings.title // 页面标题

module.exports = {
    transpileDependencies: [],
    publicPath: envConfig.publicPath,
    devServer: {
        port: 6789
    },
    configureWebpack: {
        name: name,
        resolve: {
            alias: {
                '@': resolve('src'),
                '~api': '@/api',
                '~views': '@/views',
                '~icons': '@/icons',
                '~components': '@/components'
            }
        }
    },
    chainWebpack: config => {
        config.plugin('html').tap(args => {
            args[0].title = name;
            return args;
        });
    },
    css: {
        extract: true,
        loaderOptions: {
            sass: {
                additionalData: `@import "@/styles/mixin.scss";`
            }
        }
    }
};
