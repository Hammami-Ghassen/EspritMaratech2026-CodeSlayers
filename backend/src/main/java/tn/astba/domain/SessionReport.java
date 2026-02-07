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
import java.time.LocalDate;

/**
 * A report/postponement request for a seance by a trainer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "session_reports")
public class SessionReport {

    @Id
    private String id;

    @Indexed
    private String seanceId;

    @Indexed
    private String trainerId;

    private String reason;

    /** Suggested new date (optional) */
    private LocalDate suggestedDate;

    @Builder.Default
    private ReportStatus reportStatus = ReportStatus.PENDING;

    @CreatedDate
    private Instant createdAt;
}
