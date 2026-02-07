package tn.astba.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import tn.astba.domain.Seance;
import tn.astba.domain.SeanceStatus;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SeanceRepository extends MongoRepository<Seance, String> {

    List<Seance> findByTrainerId(String trainerId);

    List<Seance> findByGroupId(String groupId);

    List<Seance> findByTrainingId(String trainingId);

    List<Seance> findByTrainerIdAndDate(String trainerId, LocalDate date);

    List<Seance> findByTrainerIdAndDateBetween(String trainerId, LocalDate from, LocalDate to);

    List<Seance> findByDateBetween(LocalDate from, LocalDate to);

    List<Seance> findByDate(LocalDate date);

    List<Seance> findByTrainerIdAndStatus(String trainerId, SeanceStatus status);

    boolean existsByTrainerIdAndDateAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
            String trainerId, LocalDate date,
            java.time.LocalTime endTime, java.time.LocalTime startTime);
}
