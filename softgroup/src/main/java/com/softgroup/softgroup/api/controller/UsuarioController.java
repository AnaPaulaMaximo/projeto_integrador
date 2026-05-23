package com.softgroup.softgroup.api.controller;

import com.softgroup.softgroup.api.model.Usuario;
import com.softgroup.softgroup.api.service.AcessoService;
import com.softgroup.softgroup.api.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller de Usuários — CRUD + gerenciamento de equipes.
 *
 * Leitura de um usuário específico ou de uma equipe → qualquer autenticado.
 * Listar todos, filtros e modificações → apenas ADMIN.
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AcessoService acessoService;

    public UsuarioController(UsuarioService usuarioService, AcessoService acessoService) {
        this.usuarioService = usuarioService;
        this.acessoService = acessoService;
    }

    /** GET /api/usuarios → Lista todos os usuários ativos (ADMIN). */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    /** GET /api/usuarios/perfil/{tipo} → Filtra por tipo de perfil (ADMIN). */
    @GetMapping("/perfil/{tipoPerfil}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Usuario>> listarPorPerfil(@PathVariable String tipoPerfil) {
        return ResponseEntity.ok(usuarioService.listarPorPerfil(tipoPerfil));
    }

    /** GET /api/usuarios/equipe/{id} → Lista membros de uma equipe (qualquer autenticado). */
    @GetMapping("/equipe/{idEquipe}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Usuario>> listarPorEquipe(@PathVariable Integer idEquipe, HttpSession session) {
        Usuario logado = acessoService.obterUsuarioLogado(session);
        acessoService.validarAcessoAEquipe(logado, idEquipe);
        return ResponseEntity.ok(usuarioService.listarPorEquipe(idEquipe));
    }

    /** GET /api/usuarios/{id} → Busca um usuário (qualquer autenticado). */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Integer id, HttpSession session) {
        Usuario logado = acessoService.obterUsuarioLogado(session);
        acessoService.validarAcessoAoUsuario(logado, id);
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Usuario> criar(@Valid @RequestBody Usuario usuario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.criar(usuario));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Usuario> atualizar(@PathVariable Integer id, @Valid @RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.atualizar(id, usuario));
    }

    @PatchMapping("/{id}/inativar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> inativar(@PathVariable Integer id) {
        usuarioService.inativar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> ativar(@PathVariable Integer id) {
        usuarioService.ativar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{idUsuario}/equipes/{idEquipe}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> adicionarAEquipe(@PathVariable Integer idUsuario, @PathVariable Integer idEquipe) {
        usuarioService.adicionarAEquipe(idUsuario, idEquipe);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{idUsuario}/equipes/{idEquipe}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removerDaEquipe(@PathVariable Integer idUsuario, @PathVariable Integer idEquipe) {
        usuarioService.removerDaEquipe(idUsuario, idEquipe);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/usuarios/me/colegas → Colegas das equipes do usuário logado (para 360°). */
    @GetMapping("/me/colegas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Usuario>> meusColegas(HttpSession session) {
        Usuario logado = acessoService.obterUsuarioLogado(session);
        return ResponseEntity.ok(usuarioService.listarColegas(logado.getIdUsuario()));
    }
}
