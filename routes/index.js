const crypto=require('crypto');
const mapping = require('../static');
const User=require('../model/user');
const Post = require('../model/post');
Comment = require('../model/comment.js');
const multer  = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './public/images')
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
});
const upload = multer({
    storage: storage
});
function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录!');
        res.redirect('/login');
    }
    next();
}
function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录!');
        res.redirect('back');//返回之前的页面
    }
    next();
}
module.exports = (app)=>{
    app.get('/',(req,res)=>{
        Post.getAll(null,(err,posts)=>{
            if (err) {
                posts = [];
            }
            res.render('index',{
                title:'首页',
                user:req.session.user,
                layout:'header',
                posts:posts,
                resource:mapping.indexs,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            })
        })
    })
    app.get('/reg', checkNotLogin);
    app.get('/reg',(req,res)=>{
      res.render('reg',{
          title:'注册',
          user:req.session.user,
          layout:'header',
          resource:mapping.reg,
          success:req.flash('success').toString(),
          error:req.flash('error').toString()
      })
    })
    app.post('/reg', checkNotLogin);
    app.post('/reg',(req,res)=>{
        var name=req.body.name;
        var password=req.body.password;
        var password_re=req.body['password-repeat'];
        var email=req.body.email;
        //检查两次密码是否一致
        if(password_re!=password){
            req.flash('error','两次输入的密码不一致');
            return res.redirect('/reg');
        }
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');
        var newUser=new User({
            name:name,
            password:password,
            email:email
        })
        //检查用户名是否已经存在了
        User.get(newUser.name,(err,user)=>{
            if(err){
                req.flash('error',err);
                return res.redirect('/')
            }
            if(user){
                req.flash('error','用户名已存在');
                return res.redirect('/reg')
            }
            newUser.save((err,user)=>{
                if(err){
                    req.flash('error',err);
                    return res.redirect('/reg');
                }
                req.session.user=newUser;

                req.flash('success','注册成功');
                res.redirect('/');
            })
        })
    })
    app.get('/login', checkNotLogin);
    app.get('/login',function(req,res){
      res.render('login',{
          title:'登录',
          user:req.session.user,
          layout:'header',
          resource:mapping.login,
          success:req.flash('success').toString(),
          error:req.flash('error').toString()
      })
    })
    app.post('/login', checkNotLogin);
    app.post('/login',function(req,res){
        var md5=crypto.createHash('md5');
        var password=md5.update(req.body.password).digest('hex');
        User.get(req.body.name,(err,user)=>{
            if(!user){
                req.flash('error','用户名不存在');
                return res.redirect('/login');
            }
            if(user.password != password){
                req.flash('error','密码错误');
                return res.redirect('/login');
            }
            req.session.user=user;
            req.flash('success','登陆成功')
            res.redirect('/')
        })
    })
    app.get('/post', checkLogin);
    app.get('/post',(req,res)=>{
      res.render('post',{
          title:'发表',
          user:req.session.user,
          layout:'header',
          resource:mapping.post,
          success:req.flash('success').toString(),
          error:req.flash('error').toString()
      })
    })
    app.post('/post', checkLogin);
    app.post('/post',(req,res)=>{
        let currentUser = req.session.user;
        let post = new Post(currentUser.name, req.body.title, req.body.post);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '发布成功!');
            res.redirect('/');
        });
    })
    app.get('/logout',checkLogin);
    app.get('/logout',(req,res)=>{
        req.session.user=null;
        req.flash('success','登出成功')
        res.redirect('/');
    })

    app.get('/life',(req,res)=>{
        res.render('life',{
            title:'慢生活',
            user:req.session.user,
            layout:'header',
            resource:mapping.life,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    app.get('/doing',(req,res)=>{
        res.render('doing',{
            title:'碎言碎语',
            user:req.session.user,
            layout:'header',
            resource:mapping.doing,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    app.get('/lean',(req,res)=>{
        res.render('lean',{
            title:'学无止境',
            user:req.session.user,
            layout:'header',
            resource:mapping.lean,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    app.get('/book',(req,res)=>{
        res.render('book',{
            title:'留言板',
            user:req.session.user,
            layout:'header',
            resource:mapping.book,

            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    app.get('/about',(req,res)=>{
        res.render('about',{
            title:'关于我',
            user:req.session.user,
            layout:'header',
            resource:mapping.about,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    app.get('/upload', checkLogin);
    app.get('/upload', function (req, res) {
        res.render('upload', {
            title: '文件上传',
            user: req.session.user,
            layout:'header',
            resource:mapping.upload,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.post('/upload', checkLogin);
//一次可以上传5张
    app.post('/upload', upload.array('field1', 5), function (req, res) {
        req.flash('success', '文件上传成功!');
        res.redirect('/upload');
    });
    app.get('/u/:name', function (req, res) {
        //检查用户是否存在
        User.get(req.params.name, function (err, user) {
            if (!user) {
                req.flash('error', '用户不存在!');
                return res.redirect('/');//用户不存在则跳转到主页
            }
            //查询并返回该用户的所有文章
            Post.getAll(user.name, function (err, posts) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    layout:'header',
                    resource:mapping.indexs,
                    user : req.session.user,
                    success : req.flash('success').toString(),
                    error : req.flash('error').toString()
                });
            });
        });
    });
    app.get('/u/:name/:day/:title', function (req, res) {
        console.log(11)
        Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
            if (err) {
                console.log(22)

                req.flash('error','找不到当前文章');
                return res.redirect('/');
            }
            res.render('article', {
                title: req.params.title,
                post: post,
                layout:'header',
                resource:mapping.indexs,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),

        });
        });
    });
    app.post('/comment/:name/:minute/:title', function (req, res) {
        var date = new Date(),
            time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        var comment = {
            name: req.body.name,
            time: time,
            content: req.body.content
        };
        var newComment = new Comment(req.params.name, req.params.minute, req.params.title, comment);
        newComment.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '留言成功!');
            res.redirect('back');
        });
    });
    app.get('/edit/:name/:day/:title', checkLogin);
    app.get('/edit/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            res.render('edit', {
                title: '编辑',
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    app.post('/edit/:name/:day/:title', checkLogin);
    app.post('/edit/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
            var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
            if (err) {
                req.flash('error', err);
                return res.redirect(url);//出错！返回文章页
            }
            req.flash('success', '修改成功!');
            res.redirect(url);//成功！返回文章页
        });
    });
    app.get('/remove/:name/:day/:title', checkLogin);
    app.get('/remove/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '删除成功!');
            res.redirect('/');
        });
    });
    app.get('/archive', function (req, res) {
        Post.getArchive(function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('archive', {
                title: '存档',
                posts: posts,
                user: req.session.user,
                layout:'header',
                resource:mapping.archive,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
};
