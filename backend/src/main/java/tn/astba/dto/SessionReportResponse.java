package tn.astba.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.astba.domain.ReportStatus;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionReportResponse {
    private String id;
    private String seanceId;
    private String trainerId;
    private String trainerName;
    private String reason;
    private LocalDate suggestedDate;
    private ReportStatus reportStatus;
    private Instant createdAt;
}
