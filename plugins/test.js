const Pkg = require('../package.json')
async function register(server, pluginOptions,next) {
	console.log('这是一个插件');
	console.log('这是插件参数');

    next()
}
exports.register = register;
exports.register.attributes = { // hapi requires attributes for a plugin.
    pkg: Pkg                      // also see: http://hapijs.com/tutorials/plugins
};
  