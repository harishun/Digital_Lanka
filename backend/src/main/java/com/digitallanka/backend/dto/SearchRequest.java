package com.digitallanka.backend.dto;

import lombok.Data;

@Data
public class SearchRequest {
    private String plateNo;
    private String dlNo;
    // We would handle multipart file separately or as base64. Let's just use normal fields for now to represent compliance search.
    // Assuming image is verified client-side or we pass a boolean for prototype.
}
