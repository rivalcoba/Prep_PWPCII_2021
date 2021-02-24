import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import indexRouter from '@routes/index'
import usersRouter from '@routes/users'
// Webpack modules
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackConfig from '../webpack.dev.config'

var app = express();
// Webpack middleware
const env = process.env.NODE_ENV || 'development';
// Primero entrara en funcionamiento
if(env === 'development'){
  console.log("> Executing in Development: Webpack Hot reloading");
  // Agregando la ruta del HMR
  //reload=true:Enable auto reloading when changing JS files or content
  //timeout=1000:Time from disconnecting from server to reconnecting
  webpackConfig.entry = ['webpack-hot-middleware/client?reload=true&timeout=1000', webpackConfig.entry]

  // Agregar el plugin a la configuración de desarrollo
  // de webpack
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())

  // Creando el compilador
  const compiler = webpack(webpackConfig);

  // Habilitando el middleware en express
  app.use(webpackDevMiddleware(compiler,{
    publicPath: webpackConfig.output.publicPath
  }))

  // Habilitando el "Webpack Hot Middleware"
  app.use(webpackHotMiddleware(compiler))

}else{
  console.log("> Executing in Production");
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
