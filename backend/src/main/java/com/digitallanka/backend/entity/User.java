package com.digitallanka.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "citizens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @Column(name = "nic", nullable = false, unique = true)
    private String nic;
    
    @Column(name = "full_name", nullable = false)
    private String name;
    
    @Column(name = "blood_group")
    private String bloodGroup;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "password")
    private String password;

    @Builder.Default
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth = LocalDate.of(1990, 1, 1);

    @Builder.Default
    @Column(name = "gender")
    private String gender = "Male";

    @Builder.Default
    @Column(name = "address", columnDefinition = "TEXT")
    private String address = "123 Heritage Lane, Colombo, Sri Lanka";

    @Builder.Default
    @Column(name = "place_of_birth")
    private String placeOfBirth = "Colombo General Hospital";

    @Builder.Default
    @Column(name = "donor")
    private Boolean donor = true;

    @Builder.Default
    @Column(name = "vehicle_classes", columnDefinition = "TEXT")
    private String vehicleClasses = "[]";
}
