package tn.astba.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.astba.domain.*;
import tn.astba.dto.*;
import tn.astba.exception.ConflictException;
import tn.astba.exception.ResourceNotFoundException;
import tn.astba.repository.EnrollmentRepository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentService studentService;
    private final TrainingService trainingService;
    private final GroupService groupService;

    public EnrollmentResponse create(EnrollmentCreateRequest request) {
        // Verify student and training exist
        studentService.getStudentOrThrow(request.getStudentId());
        trainingService.getTrainingOrThrow(request.getTrainingId());

        // Check for duplicate enrollment
        if (enrollmentRepository.existsByStudentIdAndTrainingId(request.getStudentId(), request.getTrainingId())) {
            throw new ConflictException("L'élève est déjà inscrit à cette formation");
        }

        Training training = trainingService.getTrainingOrThrow(request.getTrainingId());

        // Auto-excuse past sessions for late enrollments.
        // Sessions with a plannedAt in the past are automatically marked EXCUSED
        // so the student isn't penalized for sessions they couldn't attend.
        Map<String, AttendanceEntry> attendance = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        for (Level level : training.getLevels()) {
            for (Session session : level.getSessions()) {
                if (session.getPlannedAt() != null && session.getPlannedAt().isBefore(now)) {
                    attendance.put(session.getSessionId(), AttendanceEntry.builder()
                            .status(AttendanceStatus.EXCUSED)
                            .markedAt(Instant.now())
                            .build());
                }
            }
        }

        Enrollment enrollment = Enrollment.builder()
                .studentId(request.getStudentId())
                .trainingId(request.getTrainingId())
                .groupId(request.getGroupId())
                .enrolledAt(Instant.now())
                .attendance(attendance)
                .build();

        // Initialize progress snapshot
        enrollment.setProgressSnapshot(ProgressCalculator.compute(enrollment, training));

        Enrollment saved = enrollmentRepository.save(enrollment);
        log.debug("Inscription créée: student={}, training={}, autoExcused={}",
                request.getStudentId(), request.getTrainingId(), attendance.size());
        return toResponse(saved, true);
    }

    public EnrollmentResponse findById(String id) {
        Enrollment enrollment = getEnrollmentOrThrow(id);
        return toResponse(enrollment, true);
    }

    public List<EnrollmentResponse> findByStudentId(String studentId) {
        studentService.getStudentOrThrow(studentId);
        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(e -> toResponse(e, true))
                .toList();
    }

    public List<EnrollmentResponse> findByTrainingId(String trainingId) {
        trainingService.getTrainingOrThrow(trainingId);
        return enrollmentRepository.findByTrainingId(trainingId).stream()
                .map(e -> toResponse(e, true))
                .toList();
    }

    public Enrollment getEnrollmentOrThrow(String id) {
        return enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription", "id", id));
    }

    /**
     * Reassign a student's enrollment to a different group.
     * This also moves the student between groups (removes from old, adds to new).
     */
    public EnrollmentResponse reassignGroup(String enrollmentId, String newGroupId) {
        Enrollment enrollment = getEnrollmentOrThrow(enrollmentId);
        String studentId = enrollment.getStudentId();
        String oldGroupId = enrollment.getGroupId();

        // Validate new group exists and belongs to the same training
        Group newGroup = groupService.getGroupOrThrow(newGroupId);
        if (!newGroup.getTrainingId().equals(enrollment.getTrainingId())) {
            throw new ConflictException("Le nouveau groupe n'appartient pas à la même formation");
        }

        // Remove student from old group if set
        if (oldGroupId != null && !oldGroupId.isBlank()) {
            try {
                groupService.removeStudent(oldGroupId, studentId);
            } catch (ResourceNotFoundException ignored) {
                // Old group may have been deleted
            }
        }

        // Add student to new group
        groupService.addStudent(newGroupId, studentId);

        // Update enrollment
        enrollment.setGroupId(newGroupId);
        Enrollment saved = enrollmentRepository.save(enrollment);
        log.debug("Inscription réaffectée: enrollment={}, oldGroup={}, newGroup={}",
                enrollmentId, oldGroupId, newGroupId);
        return toResponse(saved, true);
    }

    public EnrollmentResponse toResponse(Enrollment e, boolean enriched) {
        EnrollmentResponse.EnrollmentResponseBuilder builder = EnrollmentResponse.builder()
                .id(e.getId())
                .studentId(e.getStudentId())
                .trainingId(e.getTrainingId())
                .groupId(e.getGroupId())
                .enrolledAt(e.getEnrolledAt())
                .attendance(e.getAttendance())
                .progressSnapshot(e.getProgressSnapshot())
                .createdAt(e.getCreatedAt());

        if (enriched) {
            try {
                builder.student(studentService.toResponse(studentService.getStudentOrThrow(e.getStudentId())));
            } catch (ResourceNotFoundException ignored) {}
            try {
                builder.training(trainingService.toResponse(trainingService.getTrainingOrThrow(e.getTrainingId())));
            } catch (ResourceNotFoundException ignored) {}
        }

        return builder.build();
    }
}
