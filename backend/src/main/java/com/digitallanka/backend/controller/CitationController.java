package com.digitallanka.backend.controller;

import com.digitallanka.backend.entity.Citation;
import com.digitallanka.backend.entity.CitationStatus;
import com.digitallanka.backend.model.User;
import com.digitallanka.backend.repository.CitationRepository;
import com.digitallanka.backend.repository.UserRepository;
import com.digitallanka.backend.util.FileUploadUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/citations")
public class CitationController {

    @Autowired
    private CitationRepository citationRepository;

    @Autowired
    private UserRepository userRepository;

    // Get citations for the logged-in citizen
    @GetMapping("/my")
    public ResponseEntity<?> getMyCitations() {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Optional<User> userOpt = userRepository.findByNic(userDetails.getUsername());

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            List<Citation> myCitations = citationRepository.findByOffender(userOpt.get());
            return ResponseEntity.ok(myCitations);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    // Citizen uploads receipt -> transitions to VERIFYING
    @PostMapping("/{id}/pay")
    public ResponseEntity<?> payCitation(@PathVariable Long id, @RequestParam("receipt") MultipartFile receipt) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Optional<User> userOpt = userRepository.findByNic(userDetails.getUsername());

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            Optional<Citation> citationOpt = citationRepository.findById(id);
            if (citationOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Citation not found");
            }

            Citation citation = citationOpt.get();

            if (citation.getOffender() != null && !citation.getOffender().getNic().equals(userOpt.get().getNic())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }

            if (citation.getStatus() != CitationStatus.PENDING_PAYMENT) {
                return ResponseEntity.badRequest().body("Citation is not pending payment");
            }

            if (receipt != null && !receipt.isEmpty()) {
                FileUploadUtil.saveFile("uploads/receipts", receipt);
                citation.setStatus(CitationStatus.VERIFYING);
                citationRepository.save(citation);
                return ResponseEntity.ok("Receipt uploaded successfully. Citation is now VERIFYING.");
            } else {
                return ResponseEntity.badRequest().body("Receipt file is required.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not upload receipt");
        }
    }

    // Admin views all VERIFYING citations
    @GetMapping("/verifying")
    public ResponseEntity<?> getVerifyingCitations() {
        List<Citation> citations = citationRepository.findByStatus(CitationStatus.VERIFYING);
        return ResponseEntity.ok(citations);
    }

    // Admin marks citation as CLEARED
    @PostMapping("/{id}/clear")
    public ResponseEntity<?> clearCitation(@PathVariable Long id) {
        Optional<Citation> citationOpt = citationRepository.findById(id);
        if (citationOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Citation not found");
        }

        Citation citation = citationOpt.get();
        
        if (citation.getStatus() != CitationStatus.VERIFYING) {
            return ResponseEntity.badRequest().body("Citation must be in VERIFYING state to be cleared");
        }

        citation.setStatus(CitationStatus.CLEARED);
        citationRepository.save(citation);

        return ResponseEntity.ok("Citation cleared successfully.");
    }
}
