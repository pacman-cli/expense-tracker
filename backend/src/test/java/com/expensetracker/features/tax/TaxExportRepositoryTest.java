package com.expensetracker.features.tax;

import com.expensetracker.entity.User;
import com.expensetracker.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase
@org.springframework.test.context.TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
@org.springframework.boot.autoconfigure.domain.EntityScan(basePackages = "com.expensetracker")
public class TaxExportRepositoryTest {

    @Autowired
    private TaxExportRepository taxExportRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testSaveAndFindTaxExport() {
        // Create User
        User user = new User();
        user.setEmail("test_tax@example.com");
        user.setPassword("password");
        user.setFullName("Test User");
        user = userRepository.save(user);

        // Create TaxExport
        TaxExport export = TaxExport.builder()
                .user(user)
                .taxYear(2023)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now())
                .format(TaxExport.TaxExportFormat.CSV)
                .exportType(TaxExport.TaxExportType.FULL_YEAR)
                .fileName("test_export.csv")
                .fileSize(1024L)
                .status(TaxExport.ExportStatus.COMPLETED)
                .build();

        // Save
        TaxExport savedExport = taxExportRepository.save(export);
        assertThat(savedExport.getId()).isNotNull();

        // Find
        Optional<TaxExport> foundExport = taxExportRepository.findById(savedExport.getId());
        assertThat(foundExport).isPresent();
        assertThat(foundExport.get().getFileName()).isEqualTo("test_export.csv");
    }
}
