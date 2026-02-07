package tn.astba.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeanceCreateRequest {

    @NotBlank(message = "L'identifiant de la formation est obligatoire")
    private String trainingId;

    @NotBlank(message = "L'identifiant de la séance est obligatoire")
    private String sessionId;

    @NotBlank(message = "L'identifiant du groupe est obligatoire")
    private String groupId;

    @NotBlank(message = "L'identifiant du formateur est obligatoire")
    private String trainerId;

    @NotNull(message = "La date est obligatoire")
    private LocalDate date;

    @NotNull(message = "L'heure de début est obligatoire")
    private LocalTime startTime;

    @NotNull(message = "L'heure de fin est obligatoire")
    private LocalTime endTime;

    private int levelNumber;
    private int sessionNumber;
    private String title;
}
