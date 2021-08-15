// MAIN SERVER FILE
require('dotenv').config()
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require("express");
const app = express()
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require('lodash')
const session = require('express-session')
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var posts = [];
const mongooseEncryption = require('mongoose-encryption');
mongoose.connect('mongodb+srv://admin-vaibhav:1234@cluster0.o34jc.mongodb.net/blogDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
const homeStartingContent = "Welcome to The Home Page"

const aboutContent = "Welcome to about us page. This is a blogging website with Node.js backend and MongoDB database. This website is hosted by Heroku."

const contactContent = "Welcome to the contact us page. Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

app.use(express.static("public"))
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({
    extended:true
}))

app.use(session({
    secret: "Our Little Secret.",
    resave:false,
    saveUninitialized:false,
}))

// PASSPORT
app.use(passport.initialize())
app.use(passport.session())



// MONGOOSE CONNECTION

//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/userDB';
mongoose.connect(mongoDB, { useNewUrlParser: true,  useUnifiedTopology: true });
//Get the default connection 
// basic schema to mongoose schema 
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model("User",userSchema) 


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -- END OF MONGOOSE

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const blogsSchema = {
  title: String,
  content: String
}
const Blog = mongoose.model("Blog", blogsSchema)
const blog1 = new Blog({
  title: 'Blog 1 titile',
  content: 'Blog 1 content Blog 1 content Blog 1 content Blog 1 content Blog 1 content Blog 1 content Blog 1 content Blog 1 content Blog 1 content Blog 1 content Blog 1 content '
})
const blog2 = new Blog({
  title: 'Blog 2 Title',
  content: 'Blog 2 Content'
})



// HOME
app.get('/', function (req, res) {
  // DISPLAY ALL BLOGS FROM MONGOOOSE DB
  Blog.find({}, (err, foundBlogs) => {
    // console.log(foundBlogs)
    res.render('home.ejs', {
      startingContent: homeStartingContent,
      posts: foundBlogs
    });
  })

})

// ABOUT
app.get('/about', function (req, res) {
  res.render('about.ejs', { aboutContent: aboutContent })
})
// CONTAT 
app.get('/contact', function (req, res) {
  res.render('contact.ejs', { contactContent: contactContent })
})
// COMPOSE
app.get('/compose', function (req, res) {
  res.render('compose.ejs')
})
// COMPOSE -- POST
app.post('/compose', function (req, res) {

  const post = {
    title: req.body.postTitle,
    content: req.body.postBody
  };
  const postsArr = []
  postsArr.push(post)
  Blog.insertMany(post, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log("Succesfully inserted 1 post")
    }
  })
  res.redirect("/")
})

app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;
    Blog.findOne({_id: requestedPostId}, function(err, post){
      res.render("post.ejs", {
        title: post.title,
        content: post.content
      });
    });
  });

// AUTHENTICATION   


// REGISTER
app.get('/register',(req,res)=>{
  res.render('register.ejs')
})
// LOGIN
app.get('/login',(req,res)=>{
  res.render('login.ejs')
})
// LOGUT - DEAUTHENTICATE -- CLOSE SESSION
app.get("/logout",(req,res)=>{
  req.logOut()
  res.redirect('/')
})
// SECRETS
app.get("/secrets",(req,res)=>{
  if(req.isAuthenticated()){
      res.render("secrets")
  }else{
      res.redirect("/login")
  }
})


// POST REQ REGISTER-- CREATE A NEW USER IN DB
app.post('/register',(req,res)=>{
  User.register({username:req.body.username}, req.body.password, (err,user)=>{
      if(err){
          console.log(user)
          res.redirect('/register')
      }else{
          passport.authenticate("local")(req,res,()=>{
              res.redirect("/secrets")
          })
      }
  })
})

// POST REQ -- LOGIN
app.post('/login',(req,res)=>{
  const user = new User({
      username: req.body.username,
      password: req.body.password
  })
  // this method comes from passport
  req.login(user,(err)=>{
      if(err){
          console.log(err)
      }else{
          passport.authenticate("local")(req,res,()=>{
              res.redirect("/secrets")
          })
      }
  })
})











var port = process.env.PORT
  
  if(port ==null || port ==""){
    port = 3000
  }
  app.listen(port, function() {
    console.log(`Server started on port ${port}`);
  });