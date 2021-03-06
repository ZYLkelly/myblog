/**
 * Created by Administrator on 2017/5/27.
 */
const mongo=require('./db');
const markdown = require('markdown').markdown;
function Post(name,title,post) {
    this.name=name;
    this.title=title;
    this.post=post;
}
module.exports=Post;
Post.prototype.save=function (callback) {
    let date=new Date();
    let time={
        date:date,
        year:date.getFullYear(),
        month:date.getFullYear() + '-' + (date.getMonth() + 1),
        day:date.getFullYear() + '-' +
        (date.getMonth() + 1) + '-' + date.getDate(),
        minute:date.getFullYear() + '-' +
        (date.getMonth() + 1) + '-' + date.getDate() + ' ' +
        date.getHours() + ':' +
        (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() + ':' + date.getSeconds())
    }
    let post={
        name:this.name,
        time:time,
        title:this.title,
        post:this.post,
        comments: [],
        pv: 0
    }
    console.log(post.title);
    mongo.open((err,db)=>{
        if(err){
            return callback(err);
        }
        db.collection('posts',(err,collection)=>{
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.insert(post,{
                safe:true
            },(err)=>{
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}
Post.getAll=(name,callback)=>{
    mongo.open((err,db)=>{
        if(err){
            return callback(err);
        }
        db.collection('posts',(err,collection)=>{
            if(err){
                mongo.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongo.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                docs.forEach(function (doc) {
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs);//成功！以数组形式返回查询的结果
            })
        })
    })
}
Post.getOne = function(name,day,title,callback){
    //打开数据库
    mongo.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取post集合
        db.collection('posts',function(err,collection){
            if(err){
                mongo.close();
                return callback(err);
            }
            //可以根据用户名、发表日期以及文章名进行查询
            collection.findOne({
                "name":name,
                "time.day":day,
                "title":title
            },function(err,doc){

                if(err){
                    mongo.close();
                    return callback(err);
                }
                //解析markdown为HTML
                if (doc) {
                    collection.update({
                        "name": name,
                        "time.day": day,
                        "title": title
                    }, {
                        $inc: {"pv": 1}
                    }, function (err) {
                        mongo.close();
                        if (err) {
                            return callback(err);
                        }
                    });

                }
                doc.post = markdown.toHTML(doc.post);
                doc.comments.forEach(function (comment) {
                    comment.content = markdown.toHTML(comment.content);
                });
                callback(null,doc);//返回查询的一篇文章
            })
        })
    })
}
Post.edit = function(name, day, title, callback) {
    //打开数据库
    mongo.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongo.close();
                return callback(err);
            }
            //根据用户名、发表日期及文章名进行查询
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function (err, doc) {
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null, doc);//返回查询的一篇文章（markdown 格式）
            });
        });
    });
};
Post.update = function(name, day, title, post, callback) {
    //打开数据库
    mongo.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongo.close();
                return callback(err);
            }
            //更新文章内容
            collection.update({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                $set: {post: post}
            }, function (err) {
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
Post.remove = function(name, day, title, callback) {
    //打开数据库
    mongo.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongo.close();
                return callback(err);
            }
            //根据用户名、日期和标题查找并删除一篇文章
            collection.remove({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                w: 1
            }, function (err) {
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
Post.getArchive = function(callback) {
    //打开数据库
    mongo.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongo.close();
                return callback(err);
            }
            //返回只包含 name、time、title 属性的文档组成的存档数组
            collection.find({}, {
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};



