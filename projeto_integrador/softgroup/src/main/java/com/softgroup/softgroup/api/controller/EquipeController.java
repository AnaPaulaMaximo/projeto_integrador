package com.softgroup.softgroup.api.controller;

import com.softgroup.softgroup.api.model.Equipe;
import com.softgroup.softgroup.api.model.Usuario;
import com.softgroup.softgroup.api.service.AcessoService;
import com.softgroup.softgroup.api.service.EquipeService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller de Equipes.
 *
 * Leitura (GET)  → qualquer usuário autenticado.
 * Escrita (POST/PUT/DELETE) → apenas ADMIN (vide SecurityConfig).
 */
@RestController
@RequestMapping("/api/equipes")
@PreAuthorize("isAuthenticated()")
public class EquipeController {

    private final EquipeService equipeService;
    private final AcessoService acessoService;

    public EquipeController(EquipeService equipeService, AcessoService acessoService) {
        this.equipeService = equipeService;
        this.acessoService = acessoService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Equipe>> listarTodas() {
        return ResponseEntity.ok(equipeService.listarTodas());
    }

    /** GET /api/equipes/minhas → Equipes do usuário logado. */
    @GetMapping("/minhas")
    public ResponseEntity<List<Equipe>> listarMinhas(HttpSession session) {
        Usuario logado = acessoService.obterUsuarioLogado(session);
        return ResponseEntity.ok(equipeService.buscarPorUsuario(logado.getIdUsuario()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipe> buscarPorId(@PathVariable Integer id, HttpSession session) {
        Usuario logado = acessoService.obterUsuarioLogado(session);
        acessoService.validarAcessoAEquipe(logado, id);
        return ResponseEntity.ok(equipeService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Equipe> criar(@RequestBody Equipe equipe) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipeService.criar(equipe));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Equipe> atualizar(@PathVariable Integer id, @RequestBody Equipe equipe) {
        return ResponseEntity.ok(equipeService.atualizar(id, equipe));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        equipeService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
