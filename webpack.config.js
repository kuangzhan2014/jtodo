const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HTMLPlugin=require('html-webpack-plugin')
const{CleanWebpackPlugin}= require('clean-webpack-plugin')

const webpack = require('webpack')
/*已废弃
const ExtractPlugin =require("extract-text-webpack-plugin")
*/
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isDev = process.env.NODE_ENV === 'development'

const config={
    //入口,_dirname是当前文件所在目录
    target:'web',
    entry:path.join(__dirname,'src/index.js'),
    mode:'development',
    output:{
      filename:'bundle.[hash:8].js',
      path:path.join(__dirname,"dist")
    },
    //webpack原生只支持js文件类型，只支持ES5语法，我们使用以.vue文件名结尾的文件时，需要为其指定loader
    module:{
        rules:[
            {
                test:/\.vue$/,
                loader:'vue-loader'
            },
            {
                test:/\.jsx$/,
                loader:'babel-loader'
            },
            //将小于1024d的图片转为base64，减少http请求
            {
                test:/\.(gif|jpg|jpeg|png|svg)$/,
                use:[
                    {
                        loader:'url-loader',
                        options:{
                            limit:1024,
                            name:'[name]-aaa.[ext]',
                            // outputPath:'assets/images'
                        }
                    }
                ]
            }
        ]
    },
    plugins:[
        new CleanWebpackPlugin(),
        new VueLoaderPlugin(),
        new HTMLPlugin(),
        new webpack.DefinePlugin({
        'process.env':{
            NODE_ENV:isDev?'"development"':'"production"'
        }
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
    ],
    optimization: {
        splitChunks: {
          chunks (chunk) {
            // exclude `my-excluded-chunk`
            return chunk.name !== 'my-excluded-chunk';
          }
        }
    }
}

if(isDev){
    config.module.rules.push({
    /*
    css预处理器，使用模块化的方式写css代码
    stylus-loader专门用来处理stylus文件，处理完成后变成css文件，
    交给css-loader.webpack的loader就是这样一级一级向上传递，
    每一层loader只处理自己关心的部分
    */
        test:/\.styl/,
        use:[
            'style-loader',
            'css-loader',{
                loader:'postcss-loader',
                options:{
                    sourceMap:true,
                }
            },
            'stylus-loader'
        ]
    })
    config.devtool = '#cheap-module-eval-source-map'
    config.devServer ={
        port:8080,
        host:'0.0.0.0',
        overlay:{
            errors:true,
        },
        // open:true  //每次打开新的页面
        // historyFallback:{},
        hot:true
    }
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
    }else {
        config.entry={
            app:path.join(__dirname,'src/index.js'),
            vendor:['vue']
        }
        config.output.filename='[name].[chunkhash:8].js'
        config.module.rules.push(
                {
                    test:/\.styl/,
                    use:[{
                        loader:MiniCssExtractPlugin.loader,
                        options:{
                           publicPath: './',
                           hmr: process.env.NODE_ENV === 'development', 
                        },
                    },
                    'css-loader',
                    {
                        loader:'postcss-loader',
                        /*需要写在stylus-loader前面*/
                        options:{
                        sourceMap:true,
                        }
                    },
                        'stylus-loader', 
                    ]
                },
        );
        config.plugins.push(
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // all options are optional
                filename: 'styles.[chunkhash].[name].css',
                chunkFilename: '[id].css',
                ignoreOrder: false, // Enable to remove warnings about conflicting order
            }),
          /* webpack 4x已废弃  
            new webpack.optimize.CommonsChunkPlugin({
                name:'vendor'
            })
          */
        );
    }

module.exports =config