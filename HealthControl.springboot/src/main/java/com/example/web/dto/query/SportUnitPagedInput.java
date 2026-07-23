package com.example.web.dto.query;

import com.example.web.tools.dto.PagedInput;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
public class SportUnitPagedInput extends PagedInput {
    @JsonProperty("Id")
    private Integer Id;

    @JsonProperty("SportId")
    private Integer SportId;

    @JsonProperty("UnitName")
    private String UnitName;
}
