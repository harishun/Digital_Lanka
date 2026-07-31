package com.digitallanka.institutionalprovisioning.controller;

import com.digitallanka.institutionalprovisioning.dto.CitizenDto;
import com.digitallanka.institutionalprovisioning.service.DrpService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/citizens")
public class CitizenController {

    private final DrpService drpService;

    public CitizenController(DrpService drpService) {
        this.drpService = drpService;
    }

    @GetMapping("/nic/{nic}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'OFFICER')")
    public ResponseEntity<CitizenDto> getCitizenByNic(@PathVariable String nic) {
        CitizenDto citizen = drpService.getCitizenByNic(nic);
        if (citizen == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(citizen);
    }
}
