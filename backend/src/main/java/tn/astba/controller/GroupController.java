package tn.astba.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.astba.dto.GroupCreateRequest;
import tn.astba.dto.GroupResponse;
import tn.astba.dto.GroupUpdateRequest;
import tn.astba.service.GroupService;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@Tag(name = "Groupes", description = "Gestion des groupes d'élèves")
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    @Operation(summary = "Lister tous les groupes")
    public ResponseEntity<List<GroupResponse>> findAll(
            @RequestParam(required = false) String trainingId) {
        if (trainingId != null && !trainingId.isBlank()) {
            return ResponseEntity.ok(groupService.findByTrainingId(trainingId));
        }
        return ResponseEntity.ok(groupService.findAll());
    }

    @GetMapping("/{groupId}")
    @Operation(summary = "Détails d'un groupe")
    public ResponseEntity<GroupResponse> findById(@PathVariable String groupId) {
        return ResponseEntity.ok(groupService.findById(groupId));
    }

    @PostMapping
    @Operation(summary = "Créer un groupe")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<GroupResponse> create(@Valid @RequestBody GroupCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.create(request));
    }

    @PutMapping("/{groupId}")
    @Operation(summary = "Mettre à jour un groupe")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<GroupResponse> update(@PathVariable String groupId,
                                                 @Valid @RequestBody GroupUpdateRequest request) {
        return ResponseEntity.ok(groupService.update(groupId, request));
    }

    @PostMapping("/{groupId}/students/{studentId}")
    @Operation(summary = "Ajouter un élève au groupe")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<GroupResponse> addStudent(@PathVariable String groupId,
                                                     @PathVariable String studentId) {
        return ResponseEntity.ok(groupService.addStudent(groupId, studentId));
    }

    @DeleteMapping("/{groupId}/students/{studentId}")
    @Operation(summary = "Retirer un élève du groupe")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<GroupResponse> removeStudent(@PathVariable String groupId,
                                                        @PathVariable String studentId) {
        return ResponseEntity.ok(groupService.removeStudent(groupId, studentId));
    }

    @DeleteMapping("/{groupId}")
    @Operation(summary = "Supprimer un groupe")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String groupId) {
        groupService.delete(groupId);
        return ResponseEntity.noContent().build();
    }
}
