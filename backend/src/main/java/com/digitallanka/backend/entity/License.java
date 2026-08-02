package com.digitallanka.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "licenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class License {

    @Id
    @Column(name = "dl_no", nullable = false, unique = true)
    private String dlNo;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nic", referencedColumnName = "nic")
    private User driver;

    @Column(name = "valid_operators")
    private String validOperators;
}
