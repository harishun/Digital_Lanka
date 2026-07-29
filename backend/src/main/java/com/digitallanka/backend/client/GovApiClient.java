package com.digitallanka.backend.client;

import com.digitallanka.backend.dto.CitizenResponse;
import com.digitallanka.backend.dto.DrivingLicenceResponse;
import com.digitallanka.backend.dto.VehicleDocumentsResponse;
import com.digitallanka.backend.dto.VehicleRegistrationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class GovApiClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gov.drp.base-url}")
    private String drpBaseUrl;

    @Value("${gov.dmt.base-url}")
    private String dmtBaseUrl;

    @Value("${gov.api-key}")
    private String apiKey;

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Gov-Api-Key", apiKey.trim());
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    // ── DRP: Citizen lookup ───────────────────────────────────────────────────

    public Optional<CitizenResponse> getCitizenByNic(String nic) {
        String url = drpBaseUrl + "/citizens/nic/" + nic;
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        try {
            ResponseEntity<CitizenResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, CitizenResponse.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return Optional.of(response.getBody());
            }
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (Exception e) {
            System.err.println("Error calling DRP Mock API: " + e.getMessage());
        }
        return Optional.empty();
    }

    // ── DMT: Driving licence lookup ───────────────────────────────────────────

    public Optional<DrivingLicenceResponse> getDrivingLicenceByNic(String nic) {
        String url = dmtBaseUrl + "/licences/nic/" + nic;
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        try {
            ResponseEntity<DrivingLicenceResponse[]> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, DrivingLicenceResponse[].class);
            if (response.getStatusCode() == HttpStatus.OK
                    && response.getBody() != null
                    && response.getBody().length > 0) {
                return Optional.of(response.getBody()[0]);
            }
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (Exception e) {
            System.err.println("Error calling DMT Mock API (licence): " + e.getMessage());
        }
        return Optional.empty();
    }

    // ── DMT: Vehicle registrations ────────────────────────────────────────────

    /**
     * Fetches all vehicles registered to the given owner NIC from the DMT mock API.
     * Endpoint: GET /api/vehicles/by-owner/{nic}
     */
    public List<VehicleRegistrationResponse> getVehiclesByOwnerNic(String nic) {
        String url = dmtBaseUrl + "/vehicles/by-owner/" + nic;
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        try {
            ResponseEntity<VehicleRegistrationResponse[]> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, VehicleRegistrationResponse[].class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return Arrays.asList(response.getBody());
            }
        } catch (HttpClientErrorException.NotFound e) {
            return List.of();
        } catch (Exception e) {
            System.err.println("Error calling DMT Mock API (vehicles by owner): " + e.getMessage());
        }
        return List.of();
    }

    /**
     * Fetches a single vehicle registration by plate number from the DMT mock API.
     * Endpoint: GET /api/vehicles/{plateNumber}
     */
    public Optional<VehicleRegistrationResponse> getVehicleByPlate(String plateNumber) {
        String encoded = UriUtils.encodePathSegment(plateNumber, StandardCharsets.UTF_8);
        URI uri = URI.create(dmtBaseUrl + "/vehicles/" + encoded);
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        try {
            ResponseEntity<VehicleRegistrationResponse> response = restTemplate.exchange(
                    uri, HttpMethod.GET, entity, VehicleRegistrationResponse.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return Optional.of(response.getBody());
            }
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (Exception e) {
            System.err.println("Error calling DMT Mock API (vehicle by plate): " + e.getMessage());
        }
        return Optional.empty();
    }

    // ── DMT: Vehicle documents ────────────────────────────────────────────────

    /**
     * Fetches all documents for a vehicle (VRC, revenue license, insurance, emission).
     * Endpoint: GET /api/vehicles/{vehicleId}/documents
     * Accepts either a plate number or legacy v1-v5 ID.
     */
    public Optional<VehicleDocumentsResponse> getVehicleDocuments(String vehicleId) {
        String encoded = UriUtils.encodePathSegment(vehicleId, StandardCharsets.UTF_8);
        URI uri = URI.create(dmtBaseUrl + "/vehicles/" + encoded + "/documents");
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        try {
            ResponseEntity<VehicleDocumentsResponse> response = restTemplate.exchange(
                    uri, HttpMethod.GET, entity, VehicleDocumentsResponse.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return Optional.of(response.getBody());
            }
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (Exception e) {
            System.err.println("Error calling DMT Mock API (vehicle documents): " + e.getMessage());
        }
        return Optional.empty();
    }
}
