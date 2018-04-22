const webpack = require('webpack');
const path = require('path');
const fs  = require('fs');
const lessToJs = require('less-vars-to-js');

const themeVariables = lessToJs(fs.readFileSync(path.join(__dirname, './src/styles/custom-ant-styles.less'), 'utf8'));

module.exports = {
  entry: [
    'babel-polyfill',
    'react-hot-loader/patch',
    './src/index.js'
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
        	loader : 'babel-loader',
        	options: {
			    presets: [],
			    plugins: [
			      ['import', { libraryName: "antd", style: true }],
            ['transform-decorators-legacy']
			    ]
			},
        }
      },
      { 
      	test: /(\.css$)/, 
      	use : [	{loader: "style-loader"},
				{loader: "css-loader"}, 
			] 
      },
      {
	    test: /\.less$/,
	    use: [
			{loader: "style-loader"},
			{loader: "css-loader"},
			{loader: "less-loader",
			  options: {
			    modifyVars: themeVariables,
			    javascriptEnabled : true
			  }
			}
	    ]
	  }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: './dist',
    port : process.env.PORT || 5000,
    hot: true
  }
};
