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

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A Group ties a Training to a cohort of students with a schedule.
 * e.g. "Groupe A – Lundi 14h00" for Training "Formation Sécurité".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "groups")
public class Group {

    @Id
    private String id;

    /** Human-readable name, e.g. "Groupe A" */
    private String name;

    @Indexed
    private String trainingId;

    /** Schedule: which day of the week */
    private DayOfWeek dayOfWeek;

    /** Schedule: start time */
    private LocalTime startTime;

    /** Schedule: end time */
    private LocalTime endTime;

    /** Student IDs belonging to this group */
    @Builder.Default
    private List<String> studentIds = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
