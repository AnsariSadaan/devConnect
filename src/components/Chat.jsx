import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createSocketConnection } from '../utils/socket.js';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../utils/constants.js';

const Chat = () => {
  const {targetUserId} = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("")
  const user =  useSelector(store => store.user);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const userId = user?._id;
  // console.log(targetUserId);

  const fetchChatMesages = async ()=> {
    try {
      const chat = await axios.get(BASE_URL + "/chat/"+ targetUserId, {
        withCredentials: true
      });

      console.log(chat.data.data.messages);

      const chatMessages = chat?.data?.data?.messages.map((msg) => {
        const {senderId, text} = msg;
        return {
          firstName: senderId?.firstName,
          lastName: senderId?.lastName,
          text
        };
      })
      setMessages(chatMessages);

    } catch (error) {
      setError(error.response || error.message);
    }
  } 

  useEffect(()=> {
    fetchChatMesages();
  }, [])

  useEffect( ()=> {
    if(!userId || !targetUserId){
      return;
    }
    const newSocket = createSocketConnection();
    setSocket(newSocket);

    newSocket.emit('joinChat', {
      firstName: user.firstName, 
      lastName: user.lastName,
      userId, 
      targetUserId
    });

    newSocket.on("messageReceived", ({ firstName, lastName, text }) => {
      console.log(firstName +" " + lastName + " : " + text);
      setMessages((messages) => [...messages, {firstName, lastName, text}])
    });

    return () => {
      console.log("socket disconnected");
      newSocket.disconnect();
    }
  }, [userId, targetUserId]);

  const sendMessage = () => {
    if (!socket) return;
    socket.emit('sendMessage', {
      firstName: user.firstName, 
      lastName: user.lastName,
      userId, 
      targetUserId, 
      text: newMessage
    });
    setNewMessage('');
  }

  return (
    <div className='w-3/4 mx-auto border border-gray-600 m-5 h-[70vh] flex flex-col'>
      <h1 className='p-5 border-b border-gray-600'>Chat</h1>
      <div className='flex-1 overflow-scroll p-5'>
        {messages.map((msg, index) => {
          return (
            <div key={index} className="chat chat-start">
              <div className="chat-header">
                {`${msg.firstName} ${msg.lastName}`}
                <time className="text-xs opacity-50">2 hours ago</time>
              </div>
              <div className="chat-bubble">{msg.text}</div>
              <div className="chat-footer opacity-50">Seen</div>
            </div>
          )
        })}
      </div>
      <div className='p-5 border-t border-gray-600 flex items-start gap-2'>
        <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className='flex-1 border border-gray-500 text-white rounded p-2' type="text" name="" id="" />
        <button onClick={sendMessage} className='btn btn-secondary'>Send</button>
      </div>
    </div>
  )
}

export default Chat