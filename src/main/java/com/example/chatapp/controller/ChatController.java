package com.example.chatapp.controller;

import com.example.chatapp.model.Message;
import com.example.chatapp.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class ChatController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Thread-safe set to store online users
    private final java.util.Set<String> onlineUsers = java.util.concurrent.ConcurrentHashMap.newKeySet();

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Message message) {
        if (message.getType() == null) {
            message.setType(com.example.chatapp.model.MessageType.CHAT);
        }
        messageRepository.save(message);
        messagingTemplate.convertAndSend("/topic/" + message.getChannel(), message);
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload Message message,
            org.springframework.messaging.simp.SimpMessageHeaderAccessor headerAccessor) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", message.getSender());
        onlineUsers.add(message.getSender());

        // Broadcast join message
        messagingTemplate.convertAndSend("/topic/" + message.getChannel(), message);

        // Broadcast updated user list
        broadcastUserList();
    }

    public void removeOnlineUser(String username) {
        onlineUsers.remove(username);
    }

    public java.util.Set<String> getOnlineUsers() {
        return onlineUsers;
    }

    private void broadcastUserList() {
        java.util.Map<String, Object> userListMessage = new java.util.HashMap<>();
        userListMessage.put("type", "USER_LIST");
        userListMessage.put("users", onlineUsers);
        messagingTemplate.convertAndSend("/topic/online", userListMessage);
    }

    // REST endpoint to fetch history
    @GetMapping("/api/messages")
    @ResponseBody
    public List<Message> getMessages(@RequestParam String channel) {
        return messageRepository.findAllByChannelOrderByTimestampAsc(channel);
    }
}
