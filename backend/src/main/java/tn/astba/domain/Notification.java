package tn.astba.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * In-app notification for users.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    /** Recipient user ID */
    @Indexed
    private String userId;

    private String title;

    private String message;

    /** Link to navigate to, e.g. "/dashboard" */
    private String link;

    private NotificationType type;

    @Builder.Default
    private boolean read = false;

    @CreatedDate
    private Instant createdAt;
}
