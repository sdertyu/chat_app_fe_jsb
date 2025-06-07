import { notifications } from './../stores/defaults'
// src/utils/stomp.ts
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'

const stompClient = new Client({
  webSocketFactory: () => new SockJS('http://localhost:3000/api/ws-chat'),
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
  debug: (str) => console.log('[STOMP DEBUG]:', str),
})

let currentSubscription: any = null

export const connectStomp = (onConnected?: () => void) => {
  stompClient.onConnect = () => {
    console.log('[STOMP] Connected')
    if (onConnected) onConnected()
    // currentSubscription = stompClient.subscribe(topic, onMessage)
  }

  stompClient.onStompError = (frame) => {
    console.error('[STOMP] Error:', frame.headers['message'])
    console.error('[STOMP] Detail:', frame.body)
  }

  stompClient.activate()
}

export const sendMessage = (destination: string, body: any) => {
  if (stompClient.connected) {
    stompClient.publish({
      destination,
      body: JSON.stringify(body),
    })
  } else {
    console.warn('[STOMP] Không thể gửi vì chưa kết nối')
  }
}

export const disconnectStomp = () => {
  if (currentSubscription) {
    currentSubscription.unsubscribe()
    currentSubscription = null
  }
  if (stompClient.active) {
    stompClient.deactivate()
  }
}

export const joinUserRoom = (func?: (payload: any) => void) => {
  if (stompClient && stompClient.connected) {
    stompClient.subscribe(`/user/queue/notifications`, (message) => {
      const payload = JSON.parse(message.body)
      if (func) func(payload)
    })
  } else {
    console.warn('[STOMP] Không thể subscribe vì chưa kết nối')
  }
}

export const joinRoom = (roomId: string) => {
  if (stompClient && stompClient.connected) {
    currentSubscription = stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
      const payload = JSON.parse(message.body)
      console.log(`Tin nhắn từ phòng ${roomId}:`, payload)
      // onMessage(payload)
    })
  }
}

export { stompClient }
