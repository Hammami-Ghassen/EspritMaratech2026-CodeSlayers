package tn.astba.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * A planned session occurrence: ties a training session to a specific date/time,
 * a group and a trainer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "seances")
public class Seance {

    @Id
    private String id;

    @Indexed
    private String trainingId;

    /** Reference to the session UUID inside Training.levels[].sessions[] */
    @Indexed
    private String sessionId;

    @Indexed
    private String groupId;

    @Indexed
    private String trainerId;

    private LocalDate date;

    private LocalTime startTime;

    private LocalTime endTime;

    @Builder.Default
    private SeanceStatus status = SeanceStatus.PLANNED;

    /** Level number (1-4) for display purposes */
    private int levelNumber;

    /** Session number (1-6) for display purposes */
    private int sessionNumber;

    /** Human-readable title, e.g. "Niveau 1 – Séance 3" */
    private String title;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
