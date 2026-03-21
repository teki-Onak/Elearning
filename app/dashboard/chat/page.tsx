'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Search, Plus, X, Loader2, Users } from 'lucide-react'
import { getPusherClient } from '@/lib/pusher'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [activeRoom, setActiveRoom] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [searchUser, setSearchUser] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)
  const pusherRef = useRef<any>(null)

  useEffect(() => {
    fetchRooms()
    fetchUsers()
    fetch('/api/profile').then(r => r.json()).then(data => {
      console.log('Profile data:', data)
      if (data?.id) setCurrentUserId(data.id)
    }).catch((err) => console.error('Profile error:', err))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!activeRoom) return
    if (!pusherRef.current) {
      pusherRef.current = getPusherClient()
    }
    const pusher = pusherRef.current
    if (!pusher) return
    if (channelRef.current) {
      channelRef.current.unbind_all()
      pusher.unsubscribe(`chat-${activeRoom.id}`)
    }
    fetchMessages(activeRoom.id)
    const channel = pusher.subscribe(`chat-${activeRoom.id}`)
    channel.bind('new-message', (message: any) => {
      setMessages(prev => {
        if (prev.find((m: any) => m.id === message.id)) return prev
        return [...prev, message]
      })
    })
    channelRef.current = channel
    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`chat-${activeRoom.id}`)
    }
  }, [activeRoom])

  const fetchRooms = async () => {
    const res = await fetch('/api/chat')
    const data = await res.json()
    if (Array.isArray(data)) {
      const seen = new Set()
      const unique = data.filter((r: any) => {
        if (seen.has(r.id)) return false
        seen.add(r.id)
        return true
      })
      setRooms(unique)
    }
    setLoading(false)
  }

  const fetchUsers = async () => {
    const res = await fetch('/api/chat/users')
    const data = await res.json()
    setUsers(Array.isArray(data) ? data : [])
  }

  const fetchMessages = async (roomId: string) => {
    const res = await fetch(`/api/chat/messages?roomId=${roomId}`)
    const data = await res.json()
    setMessages(Array.isArray(data) ? data : [])
  }

  const startDirectChat = async (userId: string) => {
    const existing = rooms.find((r: any) =>
      r.type === 'direct' && r.members?.some((m: any) => m.user.id === userId)
    )
    if (existing) {
      setActiveRoom(existing)
      setShowNewChat(false)
      setSearchUser('')
      return
    }
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type: 'direct' }),
    })
    const room = await res.json()
    if (!room.id) return
    setActiveRoom(room)
    await fetchRooms()
    setShowNewChat(false)
    setSearchUser('')
  }

    const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || sending) return
    const content = newMessage
    setNewMessage('')
    setSending(true)

    // Optimistically add message immediately
    const tempMessage = {
      id: `temp-${Date.now()}`,
      roomId: activeRoom.id,
      content,
      createdAt: new Date().toISOString(),
      user: { id: currentUserId, name: 'You', avatar: null },
    }
    setMessages(prev => [...prev, tempMessage])

    const res = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: activeRoom.id, content }),
    })

    if (!res.ok) {
      toast.error('Failed to send message')
      setNewMessage(content)
      // Remove temp message on failure
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
    } else {
      // Replace temp message with real one
      const real = await res.json()
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? real : m))
    }
    setSending(false)
  }

  const getRoomName = (room: any) => {
    if (room.type === 'group') return room.name || 'Group Chat'
    const other = room.members?.find((m: any) => m.user.id !== currentUserId)
    return other?.user?.name || 'Unknown'
  }

  const getRoomAvatar = (room: any) => {
    if (room.type === 'group') return null
    const other = room.members?.find((m: any) => m.user.id !== currentUserId)
    return other?.user?.avatar || null
  }

  const getRoomInitial = (room: any) => getRoomName(room)[0]?.toUpperCase() || '?'

  const filteredUsers = users.filter((u: any) =>
    u.name.toLowerCase().includes(searchUser.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-slate-800">
      {/* Sidebar */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary-400" /> Messages
            </h2>
            <button onClick={() => setShowNewChat(!showNewChat)} className="btn-ghost p-1.5">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {showNewChat && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={searchUser}
                  onChange={e => setSearchUser(e.target.value)}
                  placeholder="Search users..."
                  className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none flex-1"
                  autoFocus
                />
                <button onClick={() => { setShowNewChat(false); setSearchUser('') }}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              {searchUser && (
                <div className="bg-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="text-slate-400 text-sm p-3">No users found</p>
                  ) : (
                    filteredUsers.map((u: any) => (
                      <button
                        key={u.id}
                        onClick={() => startDirectChat(u.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-700 transition-colors"
                      >
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center text-xs font-bold text-primary-400">
                            {u.name[0].toUpperCase()}
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-sm text-white font-medium">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.role}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No chats yet</p>
              <p className="text-slate-500 text-xs mt-1">Click + to start a conversation</p>
            </div>
          ) : (
            rooms.map((room: any) => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-slate-800 transition-colors border-b border-slate-800/50 ${activeRoom?.id === room.id ? 'bg-slate-800' : ''}`}
              >
                {getRoomAvatar(room) ? (
                  <img src={getRoomAvatar(room)} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center text-sm font-bold text-primary-400 flex-shrink-0">
                    {room.type === 'group' ? <Users className="w-5 h-5" /> : getRoomInitial(room)}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate">{getRoomName(room)}</p>
                  {room.messages?.[0] && (
                    <p className="text-xs text-slate-400 truncate">
                      {room.messages[0].user?.name}: {room.messages[0].content}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeRoom ? (
        <div className="flex-1 flex flex-col bg-slate-950">
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            {getRoomAvatar(activeRoom) ? (
              <img src={getRoomAvatar(activeRoom)} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-600/20 flex items-center justify-center text-sm font-bold text-primary-400">
                {activeRoom.type === 'group' ? <Users className="w-4 h-4" /> : getRoomInitial(activeRoom)}
              </div>
            )}
            <div>
              <p className="font-semibold text-white">{getRoomName(activeRoom)}</p>
              <p className="text-xs text-slate-400">
                {activeRoom.type === 'group' ? `${activeRoom.members?.length} members` : 'Direct Message'}
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No messages yet. Say hello! 👋</p>
              </div>
            ) : (
              messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.user?.id === currentUserId ? 'flex-row-reverse' : ''}`}
                >
                  {msg.user?.avatar ? (
                    <img src={msg.user.avatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary-600/20 flex items-center justify-center text-xs font-bold text-primary-400 flex-shrink-0">
                      {msg.user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className={`max-w-xs lg:max-w-md flex flex-col ${msg.user?.id === currentUserId ? 'items-end' : 'items-start'}`}>
                    {msg.user?.id !== currentUserId && (
                      <p className="text-xs text-slate-400 mb-1 px-1">{msg.user?.name}</p>
                    )}
                    <div className={`px-4 py-2 rounded-2xl text-sm ${
                      msg.user?.id === currentUserId
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 bg-slate-800 rounded-2xl px-4 py-2">
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="bg-transparent flex-1 text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-950">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Select a chat to start messaging</p>
            <p className="text-slate-500 text-sm mt-1">Or click + to start a new conversation</p>
          </div>
        </div>
      )}
    </div>
  )
}
