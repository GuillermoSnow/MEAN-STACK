const User = require('../models/user'); // Import User Model Schema
const Blog = require('../models/blog'); // Import Blog Model Schema
const jwt = require('jsonwebtoken'); // Compact, URL-safe means of representing claims to be transferred between two parties.
const config = require('../config/database'); // Import database configuration

module.exports = (router) => {

  /* ===============================================================
     CREATE NEW BLOG
  =============================================================== */
  router.post('/newBlog', (req, res) => {
    // Check if blog title was provided
    if (!req.body.title) { 
      res.json({ success: false, message: 'Blog title is required.' }); // Return error message
    } else {
      // Check if blog body was provided
      if (!req.body.body) {
        res.json({ success: false, message: 'Blog body is required.' }); // Return error message
      } else {
        // Check if blog's creator was provided
        if (!req.body.createdBy) {
          res.json({ success: false, message: 'Blog creator is required.' }); // Return error
        } else {
          // Create the blog object for insertion into database
          const blog = new Blog({
            title: req.body.title, // Title field
            body: req.body.body, // Body field
            createdBy: req.body.createdBy // CreatedBy field
          });
          // Save blog into database
          blog.save((err) => {
            // Check if error
            if (err) {
              // Check if error is a validation error
              if (err.errors) {
                // Check if validation error is in the title field
                if (err.errors.title) {
                  res.json({ success: false, message: err.errors.title.message }); // Return error message
                } else {
                  // Check if validation error is in the body field
                  if (err.errors.body) {
                    res.json({ success: false, message: err.errors.body.message }); // Return error message
                  } else {
                    res.json({ success: false, message: err }); // Return general error message
                  }
                }
              } else {
                res.json({ success: false, message: err }); // Return general error message
              }
            } else {
              res.json({ success: true, message: 'Blog saved!' }); // Return success message
            }
          });
        }
      }
    }
  });

  router.get('/allBlogs', (req, res) => {
    // Search database for all blog posts
    Blog.find({}, (err, blogs) => {
      // Check if error was found or not
      if (err) {
        res.json({ success: false, message: err }); // Return error message
      } else {
        // Check if blogs were found in database
        if (!blogs) {
          res.json({ success: false, message: 'No blogs found.' }); // Return error of no blogs found
        } else {
          res.json({ success: true, blog: blogs }); // Return success and blogs array
        }
      }
    }).sort({ '_id': -1 }); // Sort blogs from newest to oldest
  });

  router.get('/singleBlog/:_id',(req,res)=>{

    if(!req.params._id){
      res.json({success: false, message: 'Ningún id fue ingresado'})
    }else{
      Blog.findOne({_id: req.params._id},(err,blog)=>{
        if(err){
          res.json({success:false , message: err});
        }else{
          if(!blog){
            res.json({success: false, message: 'Blog not found'});
          }else{
            User.findOne({_id: req.decoded.userId},(err,user)=>{
              if(err){
                res.json({success: false, message: err});
              }else{
                if(!user){
                  res.json({success:false, message: 'No es posible identificar el usuario'});
                }else{
                  if(user.username!==blog.createdBy){
                    res.json({success: false, message: 'No está autorizado para editar este Blog.'});
                  }else{
                    res.json({success: true, blog: blog});
                  }
                }
              }
            });
            
          }
        }
      });
    }
    
  });

  router.put('/updateBlog',(req,res)=>{
    if(!req.body._id){
      res.json({success:flase, message: 'No se encontro identificador del Blog'});
    }else{
      
      Blog.findOne({_id:req.body._id},(err,blog)=>{
        if(err){
          res.json({success:false, message: 'Identificador no válido'});
        }else{
          if(!blog){
            res.json({success: false, message: 'No se encontro el blog'});
          }else{
            User.findOne({_id: req.decoded.userId},(err,user)=>{
              if(err){
                res.json({success: false, message: err});
              }else{
                if(!user){
                  res.json({success:false, message: 'No es posible identificar el usuario'});
                }else{
                  if(user.username!==blog.createdBy){
                    res.json({success: false, message: 'No está autorizado para editar este Blog.'});
                  }else{
                    blog.title= req.body.title;
                    blog.body=req.body.body;
                    blog.save((err)=>{
                      if(err){
                        res.json({success:false, message: 'No se pudo editar el blog'});
                      }
                      else{
                        res.json({success:true,message: 'Blog actualizado satisfactoriamente'});
                      }
                    });
                  }
                }
              }
            });
          }
        }
      })
    }
  });
  router.delete('/deleteBlog/:id',(req,res)=>{
    if(!req.params.id){
      res.json({success:false, message: 'No se otorgó un identificador'});
    }else{
      Blog.findOne({_id: req.params.id}, (err,blog)=>{
        if(err){
          res.json({success:false, message: 'Identificador no válido'});
        }else{
          if(!blog){
            res.json({success:false, message: 'Blog no encontrado'});
          }else{
            User.findOne({_id:req.decoded.userId},(err,user)=>{
              if(err){
                res.json({success:false, message:err})
              }else{
                if(!user){
                  res.json({success:false, message: 'No se pudo autentificar el usuario'});
                }else{
                  if(user.username!==blog.createdBy){
                    res.json({success:false, message: 'Usted no está autorizado para eliminar este blog'});
                  }else{
                    blog.remove((err)=>{
                      if(err){
                        res.json({success: false, message: 'No se pudo eliminar el Blog'});
                      }
                      else{
                        res.json({success: true, message: 'Blog eliminado'});
                      }
                    })
                  }
                }
              }
            });
          }
        } 
      });
    }
  });

  router.put('/likeBlog', (req, res) => {
    // Check if id was passed provided in request body
    
    if (!req.body.id) {
      res.json({ success: false, message: 'No se obtuvo el identificador' }); // Return error message
      console.log('fff');
    } else {
      
      // Search the database with id
      Blog.findOne({ _id: req.body.id }, (err, blog) => {
        // Check if error was encountered
        if (err) {
          console.log('ufmen');
          res.json({ success: false, message: 'Identificador inválido' }); // Return error message
        } else {
         
          // Check if id matched the id of a blog post in the database
          if (!blog) {
            res.json({ success: false, message: 'No se encontró el Blog.' }); // Return error message
          } else {
            
            // Get data from user that is signed in
            User.findOne({ _id: req.decoded.userId }, (err, user) => {
              // Check if error was found
              if (err) {
                res.json({ success: false, message: 'Algo salió mal.' }); // Return error message
              } else {
                
                // Check if id of user in session was found in the database
                if (!user) {
                  res.json({ success: false, message: 'No se puedo verificar el Usuario' }); // Return error message
                } else {
                  // Check if user who liked post is the same user that originally created the blog post
                  if (user.username === blog.createdBy) {
                    res.json({ success: false, messagse: 'No puedes dar like a tu propio post' }); // Return error message
                  } else {
                    // Check if the user who liked the post has already liked the blog post before
                    if (blog.likedBy.includes(user.username)) {
                      res.json({ success: false, message: 'Ya te gusta este post.' }); // Return error message
                    } else {
                      // Check if user who liked post has previously disliked a post
                      if (blog.dislikedBy.includes(user.username)) {
                        blog.dislikes--; // Reduce the total number of dislikes
                        const arrayIndex = blog.dislikedBy.indexOf(user.username); // Get the index of the username in the array for removal
                        blog.dislikedBy.splice(arrayIndex, 1); // Remove user from array
                        blog.likes++; // Increment likes
                        blog.likedBy = blog.likedBy.concat(user.username);
                        // Add username to the array of likedBy array
                        // Save blog post data
                        blog.save((err) => {
                          // Check if error was found
                          if (err) {
                            res.json({ success: false, message: 'Algo salió mal.' }); // Return error message
                          } else {
                            res.json({ success: true, message: 'Blog liked!' }); // Return success message
                          }
                        });
                      } else {
                        console.log('ENTRO');

                        blog.likes++; // Incriment likes
                        console.log(user.username);
                        //blog.likedBy.push(user.usernames); // Add liker's username into array of likedBy
                        blog.likedBy = blog.likedBy.concat(user.username);
                        // Save blog post
                        blog.save((err) => {
                          if (err) {
                            console.log(err);
                            res.json({ success: false, message: 'Algo salió mal.' }); // Return error message
                          } else {
                            console.log('stepapau');
                            res.json({ success: true, message: 'Blog liked!' }); // Return success message
                          }
                        });
                      }
                    }
                  }
                }
              }
            });
          }
        }
      });
    }
  });

  router.put('/dislikeBlog', (req, res) => {
    // Check if id was provided inside the request body
    if (!req.body.id) {
      res.json({ success: false, message: 'No id was provided.' }); // Return error message
    } else {
      // Search database for blog post using the id
      Blog.findOne({ _id: req.body.id }, (err, blog) => {
        // Check if error was found
        if (err) {
          res.json({ success: false, message: 'Invalid blog id' }); // Return error message
        } else {
          // Check if blog post with the id was found in the database
          if (!blog) {
            res.json({ success: false, message: 'That blog was not found.' }); // Return error message
          } else {
            // Get data of user who is logged in
            User.findOne({ _id: req.decoded.userId }, (err, user) => {
              // Check if error was found
              if (err) {
                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
              } else {
                // Check if user was found in the database
                if (!user) {
                  res.json({ success: false, message: 'Could not authenticate user.' }); // Return error message
                } else {
                  // Check if user who disliekd post is the same person who originated the blog post
                  if (user.username === blog.createdBy) {
                    res.json({ success: false, messagse: 'Cannot dislike your own post.' }); // Return error message
                  } else {
                    // Check if user who disliked post has already disliked it before
                    if (blog.dislikedBy.includes(user.username)) {
                      res.json({ success: false, message: 'You already disliked this post.' }); // Return error message
                    } else {
                      // Check if user has previous disliked this post
                      if (blog.likedBy.includes(user.username)) {
                        blog.likes--; // Decrease likes by one
                        const arrayIndex = blog.likedBy.indexOf(user.username); // Check where username is inside of the array
                        blog.likedBy.splice(arrayIndex, 1); // Remove username from index
                        blog.dislikes++; // Increase dislikeds by one
                        blog.dislikedBy = blog.dislikedBy.concat(user.username); // Add username to list of dislikers
                        // Save blog data
                        blog.save((err) => {
                          // Check if error was found
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                          } else {
                            res.json({ success: true, message: 'Blog disliked!' }); // Return success message
                          }
                        });
                      } else {
                        blog.dislikes++; // Increase likes by one
                        blog.dislikedBy = blog.dislikedBy.concat(user.username); // Add username to list of likers
                        // Save blog data
                        blog.save((err) => {
                          // Check if error was found
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                          } else {
                            res.json({ success: true, message: 'Blog disliked!' }); // Return success message
                          }
                        });
                      }
                    }
                  }
                }
              }
            });
          }
        }
      });
    }
  });

  router.post('/comment',(req,res)=>{
    if(!req.body.comment){
      res.json({success:false, message: 'No se comentó'});
    }else{
      if(!req.body.id){
        res.json({success:false, message: 'No se encontró identificador'});
      }else{
        Blog.findOne({_id:req.body.id},(err,blog)=>{
          if(err){
            res.json({success:false, message: 'Algo salió mal'});
          }else{
            if(!blog){
              res.json({success:false, message: 'No se encontró el Blog'});
            }else{
              User.findOne({_id:req.decoded.userId},(err,user)=>{
                if(err){
                  res.json({success:false, message: 'Algo salió mal'});
                }else{
                  if(!user){
                    res.json({success:false, message: 'Usuario no encontrado'});
                  }else{
                    blog.comments=blog.comments.concat({comment:req.body.comment, commentator: user.username});
                    blog.save((err)=>{
                      if(err){
                        res.json({success:false, message: 'Algo salio mal papu'});                        
                      }else{
                        res.json({success:true, message: 'Comentario agregado'});
                      }
                    })
                  }
                }
              });
            }
          }
        });
      }
    }
  });


  return router;
};