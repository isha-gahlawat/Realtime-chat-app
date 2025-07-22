const socket=io();

//get dom elements
const form=document.getElementById('send-container');
const messageInput=document.getElementById('messageInp');
const messagecontainer=document.querySelector(".container");
var audio =new Audio('/ting.mp3');

//function which will apend event info
const append=(message,position)=>{
  const messageElement=document.createElement('div');
  messageElement.innerText=message;
  messageElement.classList.add('message');
  messageElement.classList.add(position);
  messagecontainer.append(messageElement);
   if(position =='left'){
   audio.play();
   }
}

//ask user for name
const names = prompt("Enter your name to join");
socket.emit('new-user-joined', names);

//receive from server
socket.on('user-joined',names=>{
append(`${names} joined the chat`,'right')
})

//receive messgaes
socket.on('receive',data=>{
append(`${data.names}:${data.message}`,'left')
})

//leaving chat
socket.on('left',names=>{
append(`${names} left the chat`,'right')
})

//form get submited send server the message
form.addEventListener('submit',(e)=>{
  e.preventDefault();
  const message=messageInput.value;
  append(`You: ${message}`,'right')
  socket.emit('send',message);
  messageInput.value=''
})
