var app = require('express')();
var server = require('http').createServer(app);
 var io = require('socket.io')(server,{cors: {
  origin: "https://tictactoebyprasad.web.app",
  credentials: true
}}
//,{
//   cors: {
//     origin: "http://localhost:3000/",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Access-Control-Allow-Origin"],
//     credentials: true
//   }
// }
);




const users = [];
const port = process.env.PORT || 5000
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join', ({ name, room }) => {
    console.log("Welcome : " + name)
    users.push({ 'id': socket.id, name, room });
    socket.join(room)
    socket.emit('welcome',{'id':socket.id})
    var userinroom = 0;
    var usersinroom = [];
    users.forEach(user => {
      if (user.room === room) {
        userinroom++;
        usersinroom.push(user)
      }
    })
    // const userinroom = users.filter((user)=>{user.room == room})
    console.log(userinroom)
   
    if (userinroom === 2) {
      var other;
      if(usersinroom[0].id!== socket.id){
        socket.emit("otheruser",{'othername':usersinroom[0].name})
      }else{
        socket.emit("otheruser",{'othername':userinroom[1].name})
      }
      if(usersinroom[0].id=== socket.id){
        socket.to(room).emit("otheruser", {'othername':usersinroom[0].name});
      
      }else{
        socket.to(room).emit("otheruser", {'othername':usersinroom[1].name});
      }
    

      io.to(room).emit('allconnected', usersinroom)
      
    }
    console.log(usersinroom)
    if (usersinroom[0].id == socket.id) {
      const user = users.find((user) => user.id === socket.id);
      console.log("this is my turn")
      socket.emit('yourturn', { 'yourturn': true })
    }

  })
  socket.on('tic', ({ ticno }) => {
    const user = users.find((user) => user.id === socket.id);
    socket.broadcast.to(user.room).emit('tictoclient', { 'tic': ticno })
  })
  socket.on('winner', () => {
    const user = users.find((user) => user.id === socket.id);

    socket.broadcast.to(user.room).emit('oppwinner')
    console.log(users)
  })
  socket.on('disconnect2', () => {
    console.log('user disconnected');
    const userindex = users.findIndex((user) => user.id === socket.id)
    if (userindex !== -1) {
      users.splice(userindex, 1)[0]
      console.log(users)

    }
  }); 
  socket.on('disconnect', () => {
    console.log('user disconnected');
    const userindex = users.findIndex((user) => user.id === socket.id)
    if (userindex !== -1) {
      users.splice(userindex, 1)[0]
    }
  });
});
server.listen(port, () => { console.log("Server is running on 5000") });
