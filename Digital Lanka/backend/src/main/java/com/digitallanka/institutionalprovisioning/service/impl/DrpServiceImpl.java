package com.digitallanka.institutionalprovisioning.service.impl;

import com.digitallanka.institutionalprovisioning.dto.CitizenDto;
import com.digitallanka.institutionalprovisioning.service.DrpService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class DrpServiceImpl implements DrpService {

    private final RestTemplate restTemplate;

    @Value("${gov.drp.base-url}")
    private String drpBaseUrl;

    @Value("${gov.api-key}")
    private String govApiKey;

    public DrpServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public CitizenDto getCitizenByNic(String nic) {
        String url = drpBaseUrl + "/citizens/nic/" + nic;
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Gov-Api-Key", govApiKey);
        headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<CitizenDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    CitizenDto.class
            );
            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            // Citizen does not exist in mock DRP registry
            return null;
        } catch (Exception e) {
            System.err.println("Error calling DRP Mock API: " + e.getMessage());
            return null;
        }
    }

    @Override
    public CitizenDto createCitizen(CitizenDto citizenDto) {
        String url = drpBaseUrl + "/citizens";

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Gov-Api-Key", govApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);

        HttpEntity<CitizenDto> entity = new HttpEntity<>(citizenDto, headers);

        try {
            ResponseEntity<CitizenDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    CitizenDto.class
            );
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Error creating citizen in DRP Mock API: " + e.getMessage());
            throw new RuntimeException("Failed to register citizen in DRP: " + e.getMessage(), e);
        }
    }

    @Override
    public java.util.List<CitizenDto> getAllCitizens(int page, int limit) {
        String url = drpBaseUrl + "/citizens?page=" + page + "&limit=" + limit;
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Gov-Api-Key", govApiKey);
        headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<com.digitallanka.institutionalprovisioning.dto.DrpCitizenListResponseDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    com.digitallanka.institutionalprovisioning.dto.DrpCitizenListResponseDto.class
            );
            if (response.getBody() != null) {
                return response.getBody().getData();
            }
            return java.util.Collections.emptyList();
        } catch (Exception e) {
            System.err.println("Error calling DRP Mock API for list: " + e.getMessage());
            return java.util.Collections.emptyList();
        }
    }
}
