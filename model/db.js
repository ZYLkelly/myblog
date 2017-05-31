/**
 * Created by Administrator on 2017/5/26.
 */
const settings=require('../setting');
const Db=require('mongodb').Db;
const Connection=require('mongodb').Connection;
const Server=require('mongodb').Server;
 module.exports=new Db(
    settings.db,
    new Server(settings.host,settings.port),
    {safe:true}
)