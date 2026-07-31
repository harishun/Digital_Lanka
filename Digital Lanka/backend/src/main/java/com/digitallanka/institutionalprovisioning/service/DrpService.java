package com.digitallanka.institutionalprovisioning.service;

import com.digitallanka.institutionalprovisioning.dto.CitizenDto;

import java.util.List;

public interface DrpService {
    CitizenDto getCitizenByNic(String nic);
    CitizenDto createCitizen(CitizenDto citizenDto);
    List<CitizenDto> getAllCitizens(int page, int limit);
}
