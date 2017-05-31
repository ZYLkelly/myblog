/**
 * Created by Administrator on 2017/5/26.
 */
const mongo=require('./db');
function User(user){
    this.name=user.name;
    this.password=user.password;
    this.email=user.email;
}
module.exports=User;

User.prototype.save=function(callback){

    var user={
        name:this.name,
        password:this.password,
        email:this.email
    }
    // console.log(user);
    mongo.open((err,db)=>{
        if(err){
            return callback(err);
        }
        db.collection('users',(err,collection)=>{
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.insert(user,{safe:true},(err,user)=>{
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null,user[0])
            })
        })
    })
}
User.get=function(name,callback){
    mongo.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',(err,collection)=>{
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.findOne({name:name},(err,user)=>{
                if(err){
                    return callback(err);

                }
                callback(null,user)
                console.log(user)
            })
        })
    })
}











