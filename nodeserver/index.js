//node server handling socket io connection
const io=require('socket.io')(8000,{
  cors:{
    origin:"http://127.0.0.1:5500",
    methods:["GET","POST"]
  }
});

const users={};
//io.on -sare connections ko listen 
//socket.on ek connection join k bad kya hoga vo
io.on('connection',socket =>{
    socket.on('new-user-joined',names=>{
      console.log("New user",names);
      users[socket.id]=names;
      socket.broadcast.emit('user-joined',names) ; 
    });
    
    socket.on('send',message=>{
     socket.broadcast.emit('receive',{message:message,names:users[socket.id]})   
    });

     socket.on('disconnect',message=>{
     socket.broadcast.emit('left',users[socket.id])
     delete users[socket.id];
      })
    })