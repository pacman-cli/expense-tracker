package com.expensetracker.features.tax;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;

public class TaxExportTest {

    @Test
    public void testFileUrlJsonIgnore() throws Exception {
        TaxExport export = TaxExport.builder()
                .taxYear(2023)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now())
                .format(TaxExport.TaxExportFormat.CSV)
                .exportType(TaxExport.TaxExportType.FULL_YEAR)
                .fileName("test.csv")
                .fileUrl("very_long_secret_url_content")
                .fileSize(100L)
                .build();

        ObjectMapper mapper = new ObjectMapper();
        // Register JavaTimeModule to handle LocalDate
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

        String json = mapper.writeValueAsString(export);

        assertFalse(json.contains("fileUrl"), "JSON should not contain fileUrl");
        assertFalse(json.contains("very_long_secret_url_content"), "JSON should not contain the url content");
        assertTrue(json.contains("fileName"), "JSON should contain fileName");
    }
}
