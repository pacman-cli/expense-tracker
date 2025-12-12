package com.expensetracker.security.oauth2;

import com.expensetracker.entity.Role;
import com.expensetracker.entity.User;
import com.expensetracker.features.category.CategorySeeder;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.security.JwtUtils;
import com.expensetracker.service.RefreshTokenService;
import com.expensetracker.service.UserDetailsImpl;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategorySeeder categorySeeder;

    @Value("${app.frontendUrl:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauth2User = authToken.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // Register new user
                    User newUser = User.builder()
                            .email(email)
                            .fullName(name)
                            .password(UUID.randomUUID().toString()) // Dummy password
                            .role(Role.USER)
                            .build();
                    User savedUser = userRepository.save(newUser);
                    categorySeeder.seedDefaultCategories(savedUser.getId());
                    return savedUser;
                });

        // Create UserDetailsImpl to be compatible with JwtUtils
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        // Create an Authentication object that JwtUtils understands
        Authentication jwtAuthentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name())));

        String accessToken = jwtUtils.generateJwtToken(jwtAuthentication);
        String refreshToken = refreshTokenService.createRefreshToken(user.getId()).getToken();

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/social-callback")
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
