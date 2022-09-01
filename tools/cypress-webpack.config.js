const config = {
  module: {
    rules: [
      {
        test: /\.jsx?$|\.tsx?$/,
        use: {
          loader: 'ts-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], modules: ['src', 'node_modules']
  }
};

module.exports = config;
