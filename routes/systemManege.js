const GROUP_NAME = 'system';
const {updateGit} = require('../utils/gitUpdate')
module.exports = [
    {
        method: 'GET',
        path: `/${GROUP_NAME}`,
        handler: async (request, reply) => {
            updateGit(0,reply)
        },
        config: {
          tags: ['api', GROUP_NAME],
          description: '后台更新',
          auth: false, // 约定此接口不参与 JWT 的用户验证，会结合下面的 hapi-auth-jwt 来使用
        },
      },
]