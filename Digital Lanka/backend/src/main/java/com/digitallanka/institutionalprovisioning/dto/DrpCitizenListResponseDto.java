package com.digitallanka.institutionalprovisioning.dto;

import java.util.List;

public class DrpCitizenListResponseDto {
    private List<CitizenDto> data;

    public DrpCitizenListResponseDto() {
    }

    public List<CitizenDto> getData() {
        return data;
    }

    public void setData(List<CitizenDto> data) {
        this.data = data;
    }
}
