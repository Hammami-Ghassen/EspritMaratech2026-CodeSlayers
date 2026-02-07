package tn.astba.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import tn.astba.domain.SessionReport;

import java.util.List;

@Repository
public interface SessionReportRepository extends MongoRepository<SessionReport, String> {

    List<SessionReport> findBySeanceId(String seanceId);

    List<SessionReport> findByTrainerId(String trainerId);
}
