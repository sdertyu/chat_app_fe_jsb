import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import axios from '@/plugins/axios'

import defaults from '@/stores/defaults'
import type {
  IConversation,
  IContactGroup,
  IUser,
  INotification,
  ICall,
  ISettings,
  IEmoji,
} from '@/types'

const useStore = defineStore('chat', () => {
  // local storage
  const storage = JSON.parse(localStorage.getItem('chat') || '{}')

  // app status refs
  const status = ref('idle')

  // app data refs
  // data refs
  const user: Ref<IUser | undefined> = ref(defaults.user)
  //   const conversations: Ref<IConversation[]> = ref([])
  const conversations: Ref<IConversation[]> = ref([])
  const notifications: Ref<INotification[]> = ref(defaults.notifications || [])
  const archivedConversations: Ref<IConversation[]> = ref(defaults.archive || [])
  const calls: Ref<ICall[]> = ref(defaults.calls || [])
  const settings: Ref<ISettings> = ref(storage.settings || defaults.defaultSettings)
  const activeCall: Ref<ICall | undefined> = ref(defaults.activeCall)
  const recentEmoji: Ref<IEmoji[]> = ref(storage.recentEmoji || [])
  const emojiSkinTone: Ref<string> = ref(storage.emojiSkinTone || 'neutral')

  // ui refs
  const activeSidebarComponent: Ref<string> = ref(storage.activeSidebarComponent || 'messages')
  const delayLoading = ref(true)
  const conversationOpen: Ref<string | undefined> = ref(storage.conversationOpen)
  const callMinimized = ref(false)
  const openVoiceCall = ref(false)

  //socket status
  const isTyping = ref(false)

  // contacts grouped alphabetically.
  const contactGroups: Ref<IContactGroup[] | undefined> = computed(() => {
    if (user.value) {
      const sortedContacts = [...user.value.contacts]

      sortedContacts.sort()

      const groups: IContactGroup[] = []
      let currentLetter: string = ''
      const groupNames: string[] = []

      // create an array of letter for every different sort level.
      for (const contact of sortedContacts) {
        // if the first letter is different create a new group.
        if (contact.firstName[0].toUpperCase() !== currentLetter) {
          currentLetter = contact.firstName[0].toUpperCase()
          groupNames.push(currentLetter)
        }
      }

      // create an array that groups contact names based on the first letter;
      for (const groupName of groupNames) {
        const group: IContactGroup = { letter: groupName, contacts: [] }
        for (const contact of sortedContacts) {
          if (contact.firstName[0].toUpperCase() === groupName) {
            group.contacts.push(contact)
          }
        }
        groups.push(group)
      }

      return groups
    }
  })

  const getStatus = computed(() => status)

  const fetchConversations = async () => {
    try {
      delayLoading.value = true
      const response = await axios.get('/chat/conversations')
      if (response.status === 200) {
        conversations.value = response.data.data.map((conversation: any): IConversation => {
          // console.log(conversation)
          return {
            id: conversation.id,
            type: conversation.type || 'group',
            name: conversation.name || 'undefined',
            avatar:
              conversation.avatar ||
              'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg',
            admins: conversation.admins || undefined,
            contacts:
              conversation.participants.map((contact: any) => {
                return {
                  id: contact.usersId,
                  firstName: contact.user.firstName || '',
                  lastName: contact.user.lastName || '',
                  avatar: contact.user.avatarUrl,
                  email: contact.email || '',
                  lastSeen: contact.lastSeen || new Date(),
                  lastReadMessageId: contact.lastReadMessageId,
                }
              }) || [],
            messages:
              conversation.messages?.map((message: any) => {
                const senderParticipant = conversation.participants?.find(
                  (participant: any) => participant.usersId === message.senderId,
                )

                return {
                  id: message.id,
                  type: message.type || 'text',
                  content: message.content || '',
                  date: message.createdAt,
                  sender: senderParticipant
                    ? {
                        id: senderParticipant.usersId,
                        firstName: senderParticipant.user?.firstName || 'Unknown',
                        lastName: senderParticipant.user?.lastName || '',
                        avatar:
                          senderParticipant.users?.avatarUrl ||
                          'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg',
                        email: senderParticipant.users?.email || '',
                        lastSeen: new Date(),
                      }
                    : {
                        // Fallback nếu không tìm thấy sender
                        id: message.senderId || 0,
                        firstName: 'Unknown',
                        lastName: '',
                        avatar:
                          'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg',
                        email: '',
                        lastSeen: new Date(),
                      },
                  replyTo: message.replyTo || undefined,
                  previewData: message.previewData || undefined,
                  attachments: message.attachments || undefined,
                  state: message.state || 'sent',
                }
              }) || [],
            pinnedMessage: conversation.pinnedMessage || undefined,
            pinnedMessageHidden: conversation.pinnedMessageHidden || false,
            replyMessage: conversation.replyMessage || undefined,
            unread: conversation.unread || 0,
            draftMessage: conversation.draftMessage || '',
          }
        })

        status.value = 'success' // Set success state
        // console.log('Mapped conversations:', conversations.value)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setTimeout(() => {
        delayLoading.value = false
      }, 500)
    }
  }

  const addConversation = (conversation: any) => {
    conversations.value.push({
      id: conversation.id,
      type: conversation.type || 'group',
      name: conversation.name || 'undefined',
      avatar:
        conversation.avatars ||
        'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg',
      admins: conversation.admins || undefined,
      contacts:
        conversation.participants.map((contact: any) => {
          return {
            id: contact.id,
            firstName: contact.user.firstName || '',
            lastName: contact.user.lastName || '',
            avatar:
              contact.avatars ||
              'https://tamkytourism.com/wp-content/uploads/2025/02/avatar-vo-tri-9.jpg',
            email: contact.email || '',
            lastSeen: contact.lastSeen || new Date(),
          }
        }) || [],
      messages:
        conversation.messages?.map((message: any) => {
          return {
            id: message.id,
            type: message.type || 'text',
            content: message.content || '',
            date: message.createdAt || new Date().toISOString(),
            sender: {
              id: message.sender?.id || message.senderId,
              firstName: message.sender?.firstName || '',
              lastName: message.sender?.lastName || '',
              avatar: message.sender?.avatar || '',
              email: message.sender?.email || '',
              lastSeen: message.sender?.lastSeen || new Date(),
            },
            replyTo: message.replyTo || undefined,
            previewData: message.previewData || undefined,
            attachments: message.attachments || undefined,
            state: message.state || 'sent',
          }
        }) || [],
      pinnedMessage: conversation.pinnedMessage || undefined,
      pinnedMessageHidden: conversation.pinnedMessageHidden || false,
      replyMessage: conversation.replyMessage || undefined,
      unread: conversation.unread || 0,
      draftMessage: conversation.draftMessage || '',
    })
  }

  return {
    // status refs
    status,
    getStatus,

    // data refs
    user,
    conversations,
    contactGroups,
    notifications,
    archivedConversations,
    calls,
    settings,
    activeCall,
    recentEmoji,
    emojiSkinTone,

    // ui refs
    activeSidebarComponent,
    delayLoading,
    conversationOpen,
    callMinimized,
    openVoiceCall,

    //fetch
    addConversation,
    fetchConversations,

    //socket status
    isTyping,
  }
})

export default useStore
