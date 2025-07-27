// frontend/src/app/chat/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { ChatMessage as BackendChatMessage } from '@/types'; // Use alias to avoid naming conflict

// Define a local type for messages in the UI state
interface UIMessage {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  sources?: { content: string; metadata: any }[]; // Optional for AI messages
}

export default function ChatPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling
  const initialLoadRef = useRef(true); // To prevent re-fetching history on every render

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Redirect if not authenticated and fetch history on first load
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user && initialLoadRef.current) {
      fetchChatHistory();
      initialLoadRef.current = false; // Set to false after initial load
    }
  }, [user, isLoading, router]);


  const fetchChatHistory = async () => {
    try {
      const response = await apiClient.get<BackendChatMessage[]>('/chat/history');
      const formattedHistory: UIMessage[] = response.data.map((msg, index) => ({
        id: msg.id, // Use backend ID
        sender: msg.is_user_message ? 'user' : 'ai',
        content: msg.content,
        timestamp: msg.timestamp,
        // Sources are not stored in DB, so won't be in history
      }));
      setMessages(formattedHistory);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
      setError('Failed to load chat history. Please try again.');
    }
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    setError(null);
    setIsSending(true);

    const newUserMessage: UIMessage = {
      id: messages.length + 1, // Simple incremental ID for UI
      sender: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage(''); // Clear input immediately

    try {
      const response = await apiClient.post<{ response: string; sources: any[] }>('/chat/', {
        message: newUserMessage.content,
      });

      const newAiMessage: UIMessage = {
        id: messages.length + 2, // Simple incremental ID for UI
        sender: 'ai',
        content: response.data.response,
        timestamp: new Date().toISOString(),
        sources: response.data.sources, // Include sources
      };
      setMessages((prevMessages) => [...prevMessages, newAiMessage]);
    } catch (err) {
      console.error('Failed to get AI response:', err);
      setError('Failed to get AI response. Please try again or check server.');
      // Optionally, add a system message to the chat history
      setMessages((prevMessages) => [...prevMessages, {
        id: messages.length + 2,
        sender: 'ai',
        content: 'I\'m sorry, I encountered an error and cannot respond right now. Please try again later.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 flex flex-col p-4">
      <div className="flex-grow max-w-3xl w-full mx-auto bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 flex flex-col">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-800 dark:text-blue-300">
          Chat with AI Assistant
        </h1>

        {/* Safety Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-3 mb-4 rounded-md text-sm">
          <p>
            <strong className="font-semibold">Disclaimer:</strong> I am an AI assistant and not a licensed mental health professional. For crisis situations or clinical advice, please seek professional help immediately.
          </p>
          <p className="mt-1">
            National Suicide Prevention Lifeline (US): 988 | Crisis Text Line (US): Text HOME to 741741 | Emergency Services (India): 112
          </p>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Chat Messages Display Area */}
        <div className="flex-1 overflow-y-auto p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 mb-4 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
              <p>Start a conversation! Ask me anything about mental health or self-help.</p>
              <p className="text-sm mt-2">I can also factor in your recent moods and journal entries.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-100'
                  }`}
                >
                  <p className="font-semibold mb-1">
                    {msg.sender === 'user' ? 'You' : 'AI Assistant'}
                  </p>
                  <p>{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && msg.sender === 'ai' && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-300 dark:border-gray-500 pt-2">
                      <p className="font-medium">Sources:</p>
                      <ul className="list-disc list-inside">
                        {msg.sources.slice(0, 1).map((source, idx) => ( // Show only first source for brevity
                          <li key={idx}>
                            {source.content.length > 100 ? source.content.substring(0, 100) + '...' : source.content}
                            {/* Add metadata like source.metadata.source if available */}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-right text-xs mt-1 opacity-75">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} /> {/* Scroll target */}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="flex mt-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isSending ? 'Sending...' : 'Type your message...'}
            className="flex-1 p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
            disabled={isSending}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-r-lg focus:outline-none focus:shadow-outline transition-colors duration-200"
            disabled={isSending}
          >
            {isSending ? '...' : 'Send'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-blue-500 dark:text-blue-300 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}