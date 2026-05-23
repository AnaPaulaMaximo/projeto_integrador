package com.softgroup.softgroup.api.controller;

import com.softgroup.softgroup.api.config.OAuth2LoginSuccessHandler;
import com.softgroup.softgroup.api.model.Usuario;
import com.softgroup.softgroup.api.repository.UsuarioRepository;
import com.softgroup.softgroup.api.service.AcessoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller de autenticação.
 *
 * Três endpoints:
 *  - POST /api/auth/login  → Login simples por e-mail (usa a sessão).
 *                            Útil para desenvolvimento/demo sem depender do Google.
 *  - POST /api/auth/logout → Encerra a sessão.
 *  - GET  /api/me          → Retorna os dados do usuário logado.
 */
@RestController
@RequestMapping("/api")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final AcessoService acessoService;

    public AuthController(UsuarioRepository usuarioRepository, AcessoService acessoService) {
        this.usuarioRepository = usuarioRepository;
        this.acessoService = acessoService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body,
                                                     HttpServletRequest request) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        if (email.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", "E-mail é obrigatório"));
        }

        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "Usuário não encontrado"));
        }
        if ("INATIVO".equals(usuario.getStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("erro", "Usuário inativo"));
        }

        // Configura a autenticação do Spring Security
        String role = "ROLE_" + usuario.getTipoPerfil().toUpperCase();
        var authToken = new UsernamePasswordAuthenticationToken(
                usuario.getEmail(), null, List.of(new SimpleGrantedAuthority(role)));
        SecurityContextHolder.getContext().setAuthentication(authToken);

        // Salva na sessão
        HttpSession session = request.getSession(true);
        session.setAttribute("usuarioLogado", usuario);
        session.setAttribute("idUsuario", usuario.getIdUsuario());
        session.setAttribute("tipoPerfil", usuario.getTipoPerfil());
        // Persiste o SecurityContext na sessão (necessário para requisições futuras)
        session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

        return ResponseEntity.ok(Map.of(
                "idUsuario",   usuario.getIdUsuario(),
                "nome",        usuario.getNome(),
                "email",       usuario.getEmail(),
                "cargo",       usuario.getCargo(),
                "tipoPerfil",  usuario.getTipoPerfil(),
                "status",      usuario.getStatus(),
                "redirectUrl", OAuth2LoginSuccessHandler.paginaInicialPorPerfil(usuario.getTipoPerfil())
        ));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> me(HttpSession session) {
        Usuario usuario = acessoService.obterUsuarioLogado(session);
        return ResponseEntity.ok(Map.of(
                "idUsuario",   usuario.getIdUsuario(),
                "nome",        usuario.getNome(),
                "email",       usuario.getEmail(),
                "cargo",       usuario.getCargo(),
                "tipoPerfil",  usuario.getTipoPerfil(),
                "status",      usuario.getStatus()
        ));
    }
}
