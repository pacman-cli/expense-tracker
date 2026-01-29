package com.expensetracker.config;

import com.expensetracker.features.category.Category;
import com.expensetracker.features.expense.Expense;
import com.expensetracker.entity.Role;
import com.expensetracker.entity.User;
import com.expensetracker.features.category.CategoryRepository;
import com.expensetracker.features.expense.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   CategoryRepository categoryRepository,
                                   ExpenseRepository expenseRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            User guestUser;

            if (!userRepository.existsByEmail("guest@example.com")) {
                guestUser = new User();
                guestUser.setFullName("Guest User");
                guestUser.setEmail("guest@example.com");
                guestUser.setPassword(passwordEncoder.encode("guestpassword"));
                guestUser.setRole(Role.USER);
                guestUser = userRepository.save(guestUser);
                System.out.println("Guest user created: guest@example.com / guestpassword");
            } else {
                guestUser = userRepository.findByEmail("guest@example.com").get();
                System.out.println("Guest user already exists");
            }

            // Create sample categories if they don't exist
            if (categoryRepository.findByUserId(guestUser.getId()).isEmpty()) {
                Category food = new Category();
                food.setName("Food");
                food.setColor("#FF6B6B");
                food.setIcon("utensils");
                food.setUser(guestUser);
                categoryRepository.save(food);

                Category transport = new Category();
                transport.setName("Transport");
                transport.setColor("#4ECDC4");
                transport.setIcon("car");
                transport.setUser(guestUser);
                categoryRepository.save(transport);

                Category entertainment = new Category();
                entertainment.setName("Entertainment");
                entertainment.setColor("#95E1D3");
                entertainment.setIcon("film");
                entertainment.setUser(guestUser);
                categoryRepository.save(entertainment);

                Category shopping = new Category();
                shopping.setName("Shopping");
                shopping.setColor("#F38181");
                shopping.setIcon("shopping-bag");
                shopping.setUser(guestUser);
                categoryRepository.save(shopping);

                System.out.println("Sample categories created for guest user");

                // Create sample expenses
                Expense exp1 = new Expense();
                exp1.setDescription("Grocery Shopping");
                exp1.setAmount(BigDecimal.valueOf(125.50));
                exp1.setDate(LocalDate.now().minusDays(1));
                exp1.setCategory(food);
                exp1.setUser(guestUser);
                expenseRepository.save(exp1);

                Expense exp2 = new Expense();
                exp2.setDescription("Uber to Work");
                exp2.setAmount(BigDecimal.valueOf(15.00));
                exp2.setDate(LocalDate.now().minusDays(2));
                exp2.setCategory(transport);
                exp2.setUser(guestUser);
                expenseRepository.save(exp2);

                Expense exp3 = new Expense();
                exp3.setDescription("Movie Tickets");
                exp3.setAmount(BigDecimal.valueOf(28.00));
                exp3.setDate(LocalDate.now().minusDays(3));
                exp3.setCategory(entertainment);
                exp3.setUser(guestUser);
                expenseRepository.save(exp3);

                Expense exp4 = new Expense();
                exp4.setDescription("Coffee Shop");
                exp4.setAmount(BigDecimal.valueOf(5.50));
                exp4.setDate(LocalDate.now().minusDays(3));
                exp4.setCategory(food);
                exp4.setUser(guestUser);
                expenseRepository.save(exp4);

                Expense exp5 = new Expense();
                exp5.setDescription("New Headphones");
                exp5.setAmount(BigDecimal.valueOf(79.99));
                exp5.setDate(LocalDate.now().minusDays(5));
                exp5.setCategory(shopping);
                exp5.setUser(guestUser);
                expenseRepository.save(exp5);

                Expense exp6 = new Expense();
                exp6.setDescription("Restaurant Dinner");
                exp6.setAmount(BigDecimal.valueOf(45.00));
                exp6.setDate(LocalDate.now().minusDays(6));
                exp6.setCategory(food);
                exp6.setUser(guestUser);
                expenseRepository.save(exp6);

                Expense exp7 = new Expense();
                exp7.setDescription("Gas Station");
                exp7.setAmount(BigDecimal.valueOf(60.00));
                exp7.setDate(LocalDate.now().minusDays(7));
                exp7.setCategory(transport);
                exp7.setUser(guestUser);
                expenseRepository.save(exp7);

                System.out.println("Sample expenses created for guest user");
            }
        };
    }
}
