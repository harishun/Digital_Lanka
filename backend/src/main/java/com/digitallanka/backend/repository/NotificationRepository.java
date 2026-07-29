package com.digitallanka.backend.repository;

import com.digitallanka.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByRecipientNicAndIsReadOrderByCreatedAtDesc(String recipientNic, boolean isRead);
    List<Notification> findByRecipientNicOrderByCreatedAtDesc(String recipientNic);
    List<Notification> findByRecipientNicAndReferenceId(String recipientNic, String referenceId);
}
