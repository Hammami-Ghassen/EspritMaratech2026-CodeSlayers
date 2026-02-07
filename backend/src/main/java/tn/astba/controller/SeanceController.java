package tn.astba.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tn.astba.domain.SeanceStatus;
import tn.astba.dto.*;
import tn.astba.service.SeanceService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/seances")
@RequiredArgsConstructor
@Tag(name = "Séances", description = "Planning et gestion des séances")
public class SeanceController {

    private final SeanceService seanceService;

    @GetMapping
    @Operation(summary = "Lister toutes les séances")
    public ResponseEntity<List<SeanceResponse>> findAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date != null) {
            return ResponseEntity.ok(seanceService.findByDate(date));
        }
        if (from != null && to != null) {
            return ResponseEntity.ok(seanceService.findByDateRange(from, to));
        }
        return ResponseEntity.ok(seanceService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détails d'une séance")
    public ResponseEntity<SeanceResponse> findById(@PathVariable String id) {
        return ResponseEntity.ok(seanceService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Planifier une séance")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<SeanceResponse> create(@Valid @RequestBody SeanceCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(seanceService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une séance")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<SeanceResponse> update(@PathVariable String id,
                                                  @Valid @RequestBody SeanceCreateRequest request) {
        return ResponseEntity.ok(seanceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une séance")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        seanceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Changer le statut d'une séance")
    @PreAuthorize("hasAnyRole('TRAINER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<SeanceResponse> updateStatus(@PathVariable String id,
                                                        @RequestParam SeanceStatus status) {
        return ResponseEntity.ok(seanceService.updateStatus(id, status));
    }

    // ─── Trainer-specific endpoints ─────────────────

    @GetMapping("/my")
    @Operation(summary = "Mes séances (formateur connecté)")
    @PreAuthorize("hasAnyRole('TRAINER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<SeanceResponse>> mySeances(
            @AuthenticationPrincipal String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date != null) {
            return ResponseEntity.ok(seanceService.findByTrainerAndDate(userId, date));
        }
        if (from != null && to != null) {
            return ResponseEntity.ok(seanceService.findByTrainerBetweenDates(userId, from, to));
        }
        return ResponseEntity.ok(seanceService.findByTrainer(userId));
    }

    @PostMapping("/{id}/report")
    @Operation(summary = "Reporter une séance (formateur)")
    @PreAuthorize("hasAnyRole('TRAINER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<SessionReportResponse> reportSeance(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody SessionReportRequest request) {
        return ResponseEntity.ok(seanceService.reportSeance(id, userId, request));
    }

    @GetMapping("/{id}/reports")
    @Operation(summary = "Rapports d'une séance")
    public ResponseEntity<List<SessionReportResponse>> getReports(@PathVariable String id) {
        return ResponseEntity.ok(seanceService.getReports(id));
    }

    // ─── Availability check ─────────────────────────

    @GetMapping("/availability")
    @Operation(summary = "Vérifier la disponibilité d'un formateur")
    public ResponseEntity<java.util.Map<String, Boolean>> checkAvailability(
            @RequestParam String trainerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) java.time.LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) java.time.LocalTime endTime) {
        boolean available = seanceService.isTrainerAvailable(trainerId, date, startTime, endTime);
        return ResponseEntity.ok(java.util.Map.of("available", available));
    }
}
