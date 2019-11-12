const Joi = require('joi');
const { paginationDefine } = require('../utils/router-helper');
const models = require('../models');
const { env } = process;
const GROUP_NAME = 'goods';

module.exports = [
    {
        method: 'POST',
        path: `/${GROUP_NAME}/{shopId}/add`,
        handler: async (request, reply) => {
           try {
            const goodsList = [];
            request.payload.goodsList.forEach((item) => {
              goodsList.push(models.goods.create({
                shop_id: item.shop_id,
                name: item.name,
                // 此处单价的数值应该从商品表中反查出写入，出于教程的精简性而省略该步骤
                thumb_url: item.thumb_url
              }));
            });
            Promise.all(goodsList).then(list=>{
                reply('success')
            })
           } catch (error) {
            reply('error');
           }
        },
        config: {
          tags: ['api', GROUP_NAME],
          description: '新增商品',
          auth:false,
          validate: {
            payload: {
              goodsList:Joi.array().items(
              Joi.object().keys({
                shop_id: Joi.number().integer(),
                name: Joi.string().required(),
                thumb_url:Joi.string()
              }),)
            }
          },
        },
      },
];
