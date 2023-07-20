/* eslint-disable no-undef */
let messagesArray = [];
let socket;

const user = document.getElementById('user').value;
const chatBox = document.getElementById('chatBox');
const history = document.getElementById('history');
document.onreadystatechange = async () => {
  await fetch('http://localhost:3000/api/chat')
    .then(res => res.json())
    .then(data => {
      messagesArray = data.messages;
    }).then(() => {
      document.getElementById('chatBox').hidden = false;
      document.getElementById('chatBox').focus();
    })
    .catch(err => console.log(err));
};

socket = io();
socket.on('history', data => {
  messagesArray[messagesArray.length] = data;
  let messageDiv = '';
  Object.values(messagesArray).forEach(m => {
    messageDiv += `<div class="container message" style=""><span class="mx-4 small" style="color:lightgrey">${m.date}</span><strong>[${m.user}]</strong>: ${m.message}</div>`;
  });
  history.innerHTML = '';
  history.innerHTML = messageDiv;
});

chatBox.addEventListener('keyup', async (e) => {
  if (e.key === 'Enter') {
    if (chatBox.value.trim().length > 0) {
      // console.log('Enter');
      try {
        const body = {
          user,
          message: chatBox.value,
          date: new Date()
        };
        const response = await fetch('http://localhost:3000/api/chat', {
          method: 'post',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.status === 201) {
          const data = await response.json();
          socket = io();
          socket.emit('messageSent', data.newMessage);
        } else if (response.status === 400) {
          const data = await response.json();
          console.error(data.error);
        } else {
          throw new Error('Unexpected response');
        }
      } catch (err) {
        console.error(`Error: ${err}`);
      }
    }
    chatBox.value = '';
  }
});
