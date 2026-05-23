package com.softgroup.softgroup.api.config;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final OAuth2LoginSuccessHandler successHandler;
    private final UrlBasedCorsConfigurationSource corsConfigurationSource;
    private final ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider;
    private final String frontendBaseUrl;

    public SecurityConfig(OAuth2LoginSuccessHandler successHandler,
                          UrlBasedCorsConfigurationSource corsConfigurationSource,
                          ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider,
                          @Value("${app.frontend.base-url}") String frontendBaseUrl) {
        this.successHandler = successHandler;
        this.corsConfigurationSource = corsConfigurationSource;
        this.clientRegistrationRepositoryProvider = clientRegistrationRepositoryProvider;
        this.frontendBaseUrl = normalizarBaseUrl(frontendBaseUrl);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/h2-console/**", "/error").permitAll()
                // Auth endpoints públicos
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                // Todo o restante da API → autenticado (controllers definem roles via @PreAuthorize)
                .requestMatchers("/api/**").authenticated()
                .anyRequest().denyAll()
            )
            // H2 console usa frames; relaxa CSP só para esse path
            .headers(headers -> headers.frameOptions(f -> f.sameOrigin()))
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> response.setStatus(204))
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            )
            .exceptionHandling(ex -> ex
                // Para chamadas /api/** não autenticadas, retorna 401 em vez de redirecionar
                .defaultAuthenticationEntryPointFor(
                        (request, response, authException) -> response.sendError(401, "Não autenticado"),
                        request -> request.getRequestURI() != null && request.getRequestURI().startsWith("/api/")
                )
            );

        // OAuth2 Login só é ativado se houver ClientRegistrationRepository com registros
        // (i.e. GOOGLE_CLIENT_ID/SECRET configurados via env vars).
        ClientRegistrationRepository repo = clientRegistrationRepositoryProvider.getIfAvailable();
        if (repo != null) {
            http.oauth2Login(oauth2 -> oauth2
                    .successHandler(successHandler)
                    .failureUrl(frontendUrl("/login/index.html?error=true"))
            );
        }

        return http.build();
    }

    private String frontendUrl(String path) {
        return frontendBaseUrl + path;
    }

    private static String normalizarBaseUrl(String baseUrl) {
        String valor = baseUrl == null ? "" : baseUrl.trim();
        while (valor.endsWith("/")) {
            valor = valor.substring(0, valor.length() - 1);
        }
        return valor;
    }
}
