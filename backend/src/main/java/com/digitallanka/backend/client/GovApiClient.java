package com.digitallanka.backend.client;

import com.digitallanka.backend.dto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.*;

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
        } catch (Exception e) {
            System.out.println("DRP REST API unavailable; using fallback mock for NIC: " + nic);
        }
        return getFallbackCitizen(nic);
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
        } catch (Exception e) {
            System.out.println("DMT REST API unavailable; using fallback licence mock for NIC: " + nic);
        }
        return getFallbackDrivingLicence(nic);
    }

    // ── DMT: Vehicle registrations ────────────────────────────────────────────

    public List<VehicleRegistrationResponse> getVehiclesByOwnerNic(String nic) {
        String url = dmtBaseUrl + "/vehicles/by-owner/" + nic;
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        try {
            ResponseEntity<VehicleRegistrationResponse[]> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, VehicleRegistrationResponse[].class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null && response.getBody().length > 0) {
                return Arrays.asList(response.getBody());
            }
        } catch (Exception e) {
            System.out.println("DMT REST API unavailable; using fallback vehicle list for owner NIC: " + nic);
        }
        return getFallbackVehiclesByOwnerNic(nic);
    }

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
        } catch (Exception e) {
            System.out.println("DMT REST API unavailable; using fallback vehicle lookup for plate: " + plateNumber);
        }
        return getFallbackVehicleByPlate(plateNumber);
    }

    // ── DMT: Vehicle documents ────────────────────────────────────────────────

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
        } catch (Exception e) {
            System.out.println("DMT REST API unavailable; using fallback documents for vehicle: " + vehicleId);
        }
        return getFallbackVehicleDocuments(vehicleId);
    }

    // =========================================================================
    // FALLBACK MOCK DATA PROVIDERS (Active when REST APIs are offline)
    // =========================================================================

    private static final Map<String, String> NAMES = Map.of(
            "197204509123", "W.M. SUGATHADASA",
            "198503402948", "ARJUN RANAWEERA",
            "199003402948", "K.A. DON PERERA",
            "198012304958", "MAHINDA RATHNAYAKE",
            "199556708123", "THARINDU JAYASURIYA",
            "200508901234", "SHENALI PERERA",
            "OFFICER_001", "INSPECTOR BANDARA"
    );

    private Optional<CitizenResponse> getFallbackCitizen(String nic) {
        if (!NAMES.containsKey(nic)) return Optional.empty();
        CitizenResponse c = new CitizenResponse();
        c.setNic(nic);
        c.setFullName(NAMES.get(nic));
        c.setNameOnCard(NAMES.get(nic));
        c.setGender(nic.equals("200508901234") ? "Female" : "Male");
        return Optional.of(c);
    }

    private Optional<DrivingLicenceResponse> getFallbackDrivingLicence(String nic) {
        if (!NAMES.containsKey(nic) || nic.equals("OFFICER_001")) return Optional.empty();
        DrivingLicenceResponse dl = new DrivingLicenceResponse();
        dl.setNic(nic);
        dl.setFullNameOnCard(NAMES.get(nic));
        dl.setGender(nic.equals("200508901234") ? "MALE" : "FEMALE");
        dl.setOrganDonor(true);
        dl.setDriverRestrictions("NONE");
        switch (nic) {
            case "197204509123":
                dl.setLicenceNumber("DL-1972045-Y");
                dl.setDateOfBirth("1972-06-15");
                dl.setBloodGroup("B+");
                dl.setPermanentAddress("45, Flower Road, Colombo 07");
                dl.setVehicleClasses(List.of(
                        createClass("A1", "1995-04-10", "2032-06-15"),
                        createClass("A", "1995-04-10", "2032-06-15"),
                        createClass("B", "1995-04-10", "2032-06-15"),
                        createClass("G1", "2000-01-15", "2032-06-15")
                ));
                break;
            case "198503402948":
                dl.setLicenceNumber("DL-9044231-X");
                dl.setDateOfBirth("1985-03-04");
                dl.setBloodGroup("A+");
                dl.setPermanentAddress("45, Peradeniya Rd, Kandy");
                dl.setVehicleClasses(List.of(
                        createClass("A", "2003-11-15", "2029-11-15"),
                        createClass("B", "2003-11-15", "2029-11-15")
                ));
                break;
            case "199003402948":
                dl.setLicenceNumber("DL-8822119-P");
                dl.setDateOfBirth("1990-11-20");
                dl.setBloodGroup("B+");
                dl.setPermanentAddress("12, Matara Rd, Galle");
                dl.setVehicleClasses(List.of(
                        createClass("B", "2008-06-01", "2030-06-01")
                ));
                break;
            case "198012304958":
                dl.setLicenceNumber("DL-7733441-H");
                dl.setDateOfBirth("1980-04-12");
                dl.setBloodGroup("O+");
                dl.setPermanentAddress("88, Main Street, Kurunegala");
                dl.setDriverRestrictions("CORRECTIVE_LENSES");
                dl.setVehicleClasses(List.of(
                        createClass("C1", "2002-03-10", "2025-04-12"),
                        createClass("C", "2002-03-10", "2025-04-12"),
                        createClass("CE", "2005-08-20", "2025-04-12")
                ));
                break;
            case "199556708123":
                dl.setLicenceNumber("DL-6655443-B");
                dl.setDateOfBirth("1995-09-08");
                dl.setBloodGroup("AB+");
                dl.setPermanentAddress("23, Bus Stand Rd, Negombo");
                dl.setVehicleClasses(List.of(
                        createClass("D1", "2016-05-10", "2031-09-08"),
                        createClass("D", "2016-05-10", "2031-09-08"),
                        createClass("PT", "2018-01-20", "2031-09-08")
                ));
                break;
            case "200508901234":
                dl.setLicenceNumber("DL-5544332-E");
                dl.setDateOfBirth("2005-02-14");
                dl.setBloodGroup("A-");
                dl.setPermanentAddress("101, Galle Road, Dehiwala");
                dl.setVehicleClasses(List.of(
                        createClass("B", "2023-03-01", "2033-02-14")
                ));
                break;
        }
        return Optional.of(dl);
    }

    private LicenceVehicleClassResponse createClass(String code, String issue, String expiry) {
        LicenceVehicleClassResponse r = new LicenceVehicleClassResponse();
        r.setClassCode(code);
        r.setIssuedDate(issue);
        r.setExpiryDate(expiry);
        return r;
    }

    private static final List<VehicleRegistrationResponse> ALL_MOCK_VEHICLES = List.of(
            createVehicle("WP LA-9999", "WP LA-9999", "197204509123", "Toyota Prius (Grey)", "B", "Petrol / Hybrid", "VRC-WPLA9999-88A", "CHA-782637218-X", "ENG-1NZ-991827", "2021-08-15"),
            createVehicle("WP CAD-1234", "WP CAD-1234", "197204509123", "Honda Vezel (White)", "B", "Petrol / Hybrid", "VRC-WPCAD1234-99B", "CHA-998822110-B", "ENG-L15B-228193", "2022-09-20"),
            createVehicle("WP CBA-5678", "WP CBA-5678", "197204509123", "Toyota Aqua (Blue)", "B", "Petrol / Hybrid", "VRC-WPCBA5678-77F", "CHA-334455667-A", "ENG-1LM-445522", "2023-04-12"),
            createVehicle("WP BC-5544", "WP BC-5544", "198503402948", "Yamaha FZ (Black)", "A", "Petrol", "VRC-WPBC5544-22X", "CHA-112233445-Z", "ENG-21C-558291", "2023-05-10"),
            createVehicle("WP KD-4321", "WP KD-4321", "199003402948", "Suzuki Wagon R (Red)", "B", "Petrol", "VRC-WPKD4321-44G", "CHA-556677889-C", "ENG-R06A-882291", "2024-02-18"),
            createVehicle("WP ND-8877", "WP ND-8877", "198012304958", "Isuzu Commercial Heavy Lorry (White)", "CE", "Diesel", "VRC-WPND8877-11M", "CHA-ISZ-991827-H", "ENG-4HK1-5544", "2019-01-10"),
            createVehicle("WP NB-3322", "WP NB-3322", "199556708123", "Ashok Leyland Passenger Bus (Red)", "D", "Diesel", "VRC-WPNB3322-55P", "CHA-LEY-883920-K", "ENG-6D16-9922", "2020-06-14"),
            createVehicle("WP PH-7711", "WP PH-7711", "200508901234", "Nissan Leaf EV (Silver)", "B", "Electric", "VRC-WPPH7711-99E", "CHA-NIS-772211-E", "ENG-EM57-EV01", "2023-11-05")
    );

    private static VehicleRegistrationResponse createVehicle(String id, String plate, String owner, String model, String clazz, String fuel, String docNo, String chassis, String engine, String issueDate) {
        VehicleRegistrationResponse v = new VehicleRegistrationResponse();
        v.setId(id);
        v.setPlateNumber(plate);
        v.setOwnerNic(owner);
        v.setModel(model);
        v.setVehicleClass(clazz);
        v.setFuelType(fuel);
        v.setDocNo(docNo);
        v.setChassisNo(chassis);
        v.setEngineNo(engine);
        v.setIssueDate(issueDate);
        v.setExpiryDate("Permanent / Non-Expiring");
        v.setAuthority("Department of Motor Traffic (DMT) Sri Lanka");
        v.setStatus("ACTIVE");
        return v;
    }

    private List<VehicleRegistrationResponse> getFallbackVehiclesByOwnerNic(String nic) {
        return ALL_MOCK_VEHICLES.stream()
                .filter(v -> v.getOwnerNic().equalsIgnoreCase(nic))
                .toList();
    }

    private Optional<VehicleRegistrationResponse> getFallbackVehicleByPlate(String plate) {
        return ALL_MOCK_VEHICLES.stream()
                .filter(v -> v.getPlateNumber().equalsIgnoreCase(plate) || v.getId().equalsIgnoreCase(plate))
                .findFirst();
    }

    private Optional<VehicleDocumentsResponse> getFallbackVehicleDocuments(String vehicleId) {
        Optional<VehicleRegistrationResponse> vehOpt = getFallbackVehicleByPlate(vehicleId);
        if (vehOpt.isEmpty()) return Optional.empty();
        VehicleRegistrationResponse v = vehOpt.get();

        VehicleDocumentsResponse docs = new VehicleDocumentsResponse();
        docs.setVehicleId(v.getPlateNumber());

        VehicleDocumentsResponse.VrcDoc vrc = new VehicleDocumentsResponse.VrcDoc();
        vrc.setDocNo(v.getDocNo());
        vrc.setPlateNumber(v.getPlateNumber());
        vrc.setIssueDate(v.getIssueDate());
        vrc.setExpiryDate(v.getExpiryDate());
        vrc.setAuthority(v.getAuthority());
        vrc.setChassisNo(v.getChassisNo());
        vrc.setEngineNo(v.getEngineNo());
        vrc.setFuelType(v.getFuelType());
        docs.setVrc(vrc);

        VehicleDocumentsResponse.RevenueDoc rev = new VehicleDocumentsResponse.RevenueDoc();
        rev.setLicenseNo("RL-" + Math.abs(v.getPlateNumber().hashCode()) + "-Z");
        rev.setIssueDate("2025-05-10");
        rev.setExpiryDate("2026-05-10");
        rev.setAuthority("Western Province DMT");
        rev.setStatus("ACTIVE / PAID");
        rev.setFee("LKR 4,250.00");
        docs.setRevenue(rev);

        VehicleDocumentsResponse.InsuranceDoc ins = new VehicleDocumentsResponse.InsuranceDoc();
        ins.setPolicyNo("INS-POLICY-" + Math.abs(v.getPlateNumber().hashCode()));
        ins.setUnderwriter("Sri Lanka Insurance Corporation (SLIC)");
        ins.setPolicyType("Comprehensive (Full Collision)");
        ins.setIssueDate("2026-01-10");
        ins.setExpiryDate("2027-01-10");
        ins.setPremium("LKR 65,000.00");
        docs.setInsurance(ins);

        VehicleDocumentsResponse.EmissionDoc eco = new VehicleDocumentsResponse.EmissionDoc();
        eco.setTestNo("ECO-" + Math.abs(v.getPlateNumber().hashCode()));
        eco.setTestingCenter("CleanCo Lanka (DriveGreen)");
        eco.setResult("PASSED (HC: 45ppm, CO: 0.12%)");
        eco.setIssueDate("2025-12-10");
        eco.setExpiryDate("2026-12-10");
        eco.setCoValue("0.12%");
        eco.setHcValue("45ppm");
        docs.setEmission(eco);

        return Optional.of(docs);
    }
}
