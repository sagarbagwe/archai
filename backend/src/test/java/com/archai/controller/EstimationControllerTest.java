package com.archai.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.archai.estimation.CapacityEstimator;
import com.archai.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(EstimationController.class)
@Import({CapacityEstimator.class, GlobalExceptionHandler.class})
class EstimationControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    void rejectsInvalidDailyUsers() throws Exception {
        mockMvc.perform(post("/api/estimation/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"dailyActiveUsers":0,"requestsPerUser":20,"peakMultiplier":5,
                     "readRatio":0.8,"averagePayloadBytes":1024}
                    """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_REQUEST"));
    }
}
