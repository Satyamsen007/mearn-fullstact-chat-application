import React, { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, listenForMessages, unListenForMessages } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    listenForMessages();

    return () => unListenForMessages();
  }, [getMessages, selectedUser._id, listenForMessages, unListenForMessages])

  useEffect(() => {
    if (messagesEndRef.current && messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages])

  if (isMessagesLoading) {
    return (
      <div className='flex-1 flex flex-col overflow-auto'>
        <ChatHeader />
        <MessageSkeleton />
      </div>
    )
  }


  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {
          messages.map((message) => (
            <div
              key={message._id}
              ref={messagesEndRef}
              className={`chat ${message.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}
            >
              <div className='chat-image avatar'>
                <div className='size-10 rounded-full border'>
                  <img src={message.senderId === authUser._id ? authUser.profilePicture || '/avatar.png' : selectedUser.profilePicture || '/avatar.png'} alt='Profile Picture' />
                </div>
              </div>
              <div className='chat-header mb-1'>
                <time className='text-xs opacity-50 ml-1'>{new Date(message.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</time>
              </div>
              <div className='chat-bubble flex flex-col'>
                {
                  message.image && (
                    <img src={message.image} alt="Attachment" className='sm:max-w-[200px] rounded-md mb-2' />
                  )
                }
                {message.content && <p className=''>{message.content}</p>}
              </div>

            </div>
          ))
        }
      </div>
      <MessageInput />
    </div>
  )
}

export default ChatContainer