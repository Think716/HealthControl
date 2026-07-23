package com.example.web.dto.query;

import com.example.web.tools.dto.PagedInput;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class SportRecordPagedInput extends PagedInput {
    @JsonProperty("Id")
    private Integer Id;
    @JsonProperty("SportId")
    private Integer SportId;
    @JsonProperty("SportUnitId")
    private Integer SportUnitId;
    @JsonProperty("RecordUserId")
    private Integer RecordUserId;
    @JsonProperty("RecordTimeRange")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private List<LocalDateTime> RecordTimeRange;

    public Integer getId() {
        return Id;
    }

    public void setId(Integer id) {
        Id = id;
    }
}
