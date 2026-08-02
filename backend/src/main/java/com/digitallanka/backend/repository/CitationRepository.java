package com.digitallanka.backend.repository;

import com.digitallanka.backend.entity.Citation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.digitallanka.backend.entity.User;
import com.digitallanka.backend.entity.CitationStatus;

@Repository
public interface CitationRepository extends JpaRepository<Citation, Long> {
    List<Citation> findByOffenderNic(String offenderNic);
    List<Citation> findByOffender(User offender);
    List<Citation> findByStatus(CitationStatus status);
}
