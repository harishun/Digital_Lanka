package com.digitallanka.backend.controller;

import com.digitallanka.backend.model.Notification;
import com.digitallanka.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications() {
        String nic = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Notification> list = notificationRepository.findByRecipientNicOrderByCreatedAtDesc(nic);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable("id") String id) {
        String nic = SecurityContextHolder.getContext().getAuthentication().getName();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found."));
        
        if (!notification.getRecipientNic().equals(nic)) {
            return ResponseEntity.badRequest().body("Access denied.");
        }

        notificationRepository.delete(notification);
        return ResponseEntity.ok().build();
    }
}
