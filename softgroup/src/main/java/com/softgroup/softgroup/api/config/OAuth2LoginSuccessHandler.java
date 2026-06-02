package com.softgroup.softgroup.api.config;

import com.softgroup.softgroup.api.model.Usuario;
import com.softgroup.softgroup.api.repository.UsuarioRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UsuarioRepository usuarioRepository;
    private final String frontendBaseUrl;

    public OAuth2LoginSuccessHandler(UsuarioRepository usuarioRepository,
                                     @Value("${app.frontend.base-url}") String frontendBaseUrl) {
        this.usuarioRepository = usuarioRepository;
        this.frontendBaseUrl = normalizarBaseUrl(frontendBaseUrl);
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        Map<String, Object> attributes = token.getPrincipal().getAttributes();
        String email = (String) attributes.get("email");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isEmpty() || "INATIVO".equals(usuarioOpt.get().getStatus())) {
            SecurityContextHolder.clearContext();
            request.getSession().invalidate();
            response.sendRedirect(frontendUrl("/login/index.html?error=acesso_negado"));
            return;
        }

        Usuario usuario = usuarioOpt.get();
        String role = "ROLE_" + usuario.getTipoPerfil().toUpperCase();
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);

        DefaultOAuth2User oAuth2User = new DefaultOAuth2User(
                List.of(authority), attributes, "email");

        OAuth2AuthenticationToken newToken = new OAuth2AuthenticationToken(
                oAuth2User, List.of(authority), token.getAuthorizedClientRegistrationId());

        SecurityContextHolder.getContext().setAuthentication(newToken);

        HttpSession session = request.getSession();
        session.setAttribute("usuarioLogado", usuario);
        session.setAttribute("idUsuario", usuario.getIdUsuario());
        session.setAttribute("tipoPerfil", usuario.getTipoPerfil());

        response.sendRedirect(frontendUrl(paginaInicialPorPerfil(usuario.getTipoPerfil())));
    }

    public static String paginaInicialPorPerfil(String tipoPerfil) {
        return switch (tipoPerfil.toUpperCase()) {
            case "ADMIN" -> "/admin/index.html";
            case "LIDER" -> "/lider/dashboard.html";
            default      -> "/colaborador/dashboard.html";
        };
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
