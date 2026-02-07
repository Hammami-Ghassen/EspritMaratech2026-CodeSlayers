package tn.astba.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionReportRequest {

    @NotBlank(message = "La raison est obligatoire")
    private String reason;

    /** Optional suggested new date */
    private LocalDate suggestedDate;
}
