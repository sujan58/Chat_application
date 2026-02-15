package com.example.chatapp.listener;

import com.example.chatapp.controller.ChatController;
import com.example.chatapp.model.Message;
import com.example.chatapp.model.MessageType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.HashMap;
import java.util.Map;

@Component
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    @Autowired
    private ChatController chatController;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");

        if (username != null) {
            logger.info("User Disconnected: " + username);

            chatController.removeOnlineUser(username);

            Message leaveMessage = new Message();
            leaveMessage.setType(MessageType.LEAVE);
            leaveMessage.setSender(username);
            leaveMessage.setChannel("general"); // Default or broadcast to all

            messagingTemplate.convertAndSend("/topic/general", leaveMessage);

            // Broadcast updated user list
            Map<String, Object> userListMessage = new HashMap<>();
            userListMessage.put("type", "USER_LIST");
            userListMessage.put("users", chatController.getOnlineUsers());
            messagingTemplate.convertAndSend("/topic/online", userListMessage);
        }
    }
}
