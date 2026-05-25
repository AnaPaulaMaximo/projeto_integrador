package com.softgroup.softgroup.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuração de CORS (Cross-Origin Resource Sharing).
 *
 * Permite que o frontend (rodando em localhost:5500, 3000, etc.) acesse a API.
 * allowCredentials=true é necessário para que cookies de sessão sejam enviados.
 *
 * allowedOriginPatterns aceita qualquer porta em localhost / 127.0.0.1 / file:// direto
 * (o navegador envia origin "null" quando o HTML é aberto via file:// — por isso "null" também).
 */
@Configuration
public class CorsConfig {

    private final String allowedOriginPatterns;

    public CorsConfig(@Value("${app.cors.allowed-origin-patterns}") String allowedOriginPatterns) {
        this.allowedOriginPatterns = allowedOriginPatterns;
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOriginPatterns.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();
        cfg.setAllowedOriginPatterns(origins);
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(List.of("Location"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
