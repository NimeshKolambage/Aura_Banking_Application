package com.aurabank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse {
    private boolean success;
    private String message;
    private Object data;
    private LocalDateTime timestamp;
    
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
    
    public ApiResponse(boolean success, String message, Object data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
}
