const socket=io();
let userInteracted = false;


document.addEventListener('click', () => {
  userInteracted = true;
});


//get dom elements
const form=document.getElementById('send-container');
const messageInput=document.getElementById('messageInp');
const messagecontainer=document.querySelector(".container");
const emojiToggleBtn = document.getElementById('emoji-toggle'); 
const emojiPicker = document.getElementById('emoji-picker');
var audio =new Audio('/ting.mp3');


emojiToggleBtn.addEventListener('click', () => {
  emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});

emojiPicker.addEventListener('emoji-click', (event) => {
  messageInput.value += event.detail.unicode;
  emojiPicker.style.display = 'none';
});

function scrollToBottom() {
  messagecontainer.scrollTop = messagecontainer.scrollHeight;
}

//function which will apend event info
const append = (message, position, avatar = null) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', position);

  const avatarElement = document.createElement('img');
  avatarElement.classList.add('avatar');
  avatarElement.src = avatar || '/avatars/image2.jpg'; // fallback avatar

  const textElement = document.createElement('div');
  textElement.innerText = message;

  messageElement.appendChild(avatarElement);
  messageElement.appendChild(textElement);
  messagecontainer.append(messageElement);

 if (position === 'left' && userInteracted) {
    audio.play().catch(e => {
      console.log("Audio play blocked:", e.message);
    });
  }
  scrollToBottom();
};



//ask user for name
const names = prompt("Enter your name to join");
const avatarList = [
  '/avatars/image2.jpg',
  '/avatars/image4.png',
  '/avatars/image5.png',
  '/avatars/image6.jpeg',
  '/avatars/image7.jpeg',
];
const myAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];
console.log("Using avatar:", myAvatar);
socket.emit('new-user-joined', { name: names, avatar: myAvatar });

const typingIndicator = document.createElement('div');
typingIndicator.id = 'typing-indicator';
typingIndicator.style.display = 'none';
messagecontainer.appendChild(typingIndicator);

//receive from server
socket.on('user-joined', data => {
  append(`${data.name} joined the chat`, 'right', data.avatar);
});

//receive messgaes
socket.on('receive',data=>{
append(`${data.name}:${data.message}`,'left', data.avatar)
})

//leaving chat
socket.on('left', data => {
  append(`${data.name} left the chat`, 'right', data.avatar);
});



// Emit typing event
messageInput.addEventListener('input', () => {
  socket.emit('typing', names);
});

socket.on('show-typing', (userName) => {
  if (userName !== names) {
    typingIndicator.innerHTML = `
      <span style="font-style: italic; color: white;">
        ${userName} is typing<span class="dot one">.</span><span class="dot two">.</span><span class="dot three">.</span>
      </span>`;
    typingIndicator.style.display = 'block';

    clearTimeout(typingIndicator.timeout);
    typingIndicator.timeout = setTimeout(() => {
      typingIndicator.style.display = 'none';
    }, 2000);
  }
});

//form get submited send server the message
form.addEventListener('submit',(e)=>{
  e.preventDefault();
  const message=messageInput.value;
  append(`You: ${message}`,'right')
  socket.emit('send',message);
  messageInput.value=''
})
