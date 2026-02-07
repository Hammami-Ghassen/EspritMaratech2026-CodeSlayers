package tn.astba.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupCreateRequest {

    @NotBlank(message = "Le nom du groupe est obligatoire")
    @Size(min = 1, max = 100, message = "Le nom du groupe doit contenir entre 1 et 100 caractères")
    private String name;

    @NotBlank(message = "L'identifiant de la formation est obligatoire")
    private String trainingId;

    private DayOfWeek dayOfWeek;

    private LocalTime startTime;

    private LocalTime endTime;

    private List<String> studentIds;

    /** Trainer user ID to assign to this group */
    private String trainerId;
}
