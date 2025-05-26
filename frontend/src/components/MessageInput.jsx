import { Image, Send, X, Smile } from 'lucide-react';
import React, { useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = () => {
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file", {
        style: {
          background: 'hsl(var(--b1))',
          color: 'hsl(var(--bc))',
          borderColor: 'hsl(var(--er))',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        icon: '❌',
        duration: 4000,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size should be less than 5MB", {
        style: {
          background: 'hsl(var(--b1))',
          color: 'hsl(var(--bc))',
          borderColor: 'hsl(var(--er))',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        icon: '❌',
        duration: 4000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    }
    reader.readAsDataURL(file);
  }

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }

  const onEmojiClick = (emojiObject) => {
    setContent(prevContent => prevContent + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imagePreview) return;
    if (isSending) return;

    try {
      setIsSending(true);
      await sendMessage({
        content: content.trim(),
        image: imagePreview,
      });
      setContent('');
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error);
      toast.error("Failed to send message. Please try again.", {
        style: {
          background: 'hsl(var(--b1))',
          color: 'hsl(var(--bc))',
          borderColor: 'hsl(var(--er))',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        icon: '❌',
        duration: 4000,
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className='p-4 w-full'>
      {
        imagePreview && (
          <div className='mb-3 flex items-center gap-2'>
            <div className='relative'>
              <img src={
                imagePreview
              } alt="Preview" className='w-20 h-20 object-cover rounded-lg border border-zinc-700' />
              <button className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center' type='button' onClick={removeImage}>
                <X className='size-3' />
              </button>
            </div>
          </div>
        )
      }
      <div className='relative'>
        {showEmojiPicker && (
          <div className='absolute bottom-full mb-2'>
            <EmojiPicker onEmojiClick={onEmojiClick} theme='dark' />
          </div>
        )}
        <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
          <div className='flex-1 flex gap-2'>
            <input type="text" placeholder='Type a message...' className='w-full input input-bordered rounded-lg input-sm sm:input-md' value={content} onChange={(e) => setContent(e.target.value)} />
            <input type="file" accept='image/*' ref={fileInputRef} className='hidden' onChange={handleImageChange} />
            <button
              className='hidden sm:flex btn btn-circle text-zinc-400 hover:text-zinc-200'
              type='button'
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile size={20} />
            </button>
            <button className={`hidden sm:flex btn btn-circle ${imagePreview ? 'text-emerald-500' : 'text-zinc-400'}`} type='button' onClick={() => fileInputRef.current?.click()}>
              <Image size={20} />
            </button>
          </div>
          <button
            type='submit'
            className={`btn btn-sm flex items-center justify-center btn-circle ${isSending ? 'loading loading-spinner' : ''}`}
            disabled={(!content.trim() && !imagePreview) || isSending}
          >
            {!isSending && <Send className="size-5" />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default MessageInput