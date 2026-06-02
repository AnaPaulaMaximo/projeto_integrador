package com.softgroup.softgroup.api.controller;

import com.softgroup.softgroup.api.model.Ciclo;
import com.softgroup.softgroup.api.service.CicloService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller de Ciclos de avaliação.
 *
 * Leitura (GET) → qualquer usuário autenticado.
 * Escrita (POST/PUT/PATCH) → apenas ADMIN.
 */
@RestController
@RequestMapping("/api/ciclos")
public class CicloController {

    private final CicloService cicloService;

    public CicloController(CicloService cicloService) {
        this.cicloService = cicloService;
    }

    /** GET /api/ciclos → Todos os ciclos. */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Ciclo>> listarTodos() {
        return ResponseEntity.ok(cicloService.listarTodos());
    }

    /** GET /api/ciclos/abertos → Apenas ciclos com status ABERTO. */
    @GetMapping("/abertos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Ciclo>> listarAbertos() {
        return ResponseEntity.ok(cicloService.listarAbertos());
    }

    /** GET /api/ciclos/atual → O ciclo aberto mais recente (ou 204 se não houver). */
    @GetMapping("/atual")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ciclo> buscarAtual() {
        return cicloService.buscarUltimoAberto()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    /** GET /api/ciclos/{id} → Busca um ciclo por ID. */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ciclo> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(cicloService.buscarPorId(id));
    }

    /** POST /api/ciclos → Cria um novo ciclo (ADMIN). */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ciclo> criar(@RequestBody Ciclo ciclo) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cicloService.criar(ciclo));
    }

    /** PUT /api/ciclos/{id} → Atualiza um ciclo (ADMIN). */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ciclo> atualizar(@PathVariable Integer id, @RequestBody Ciclo ciclo) {
        return ResponseEntity.ok(cicloService.atualizar(id, ciclo));
    }

    /** PATCH /api/ciclos/{id}/fechar → Fecha o ciclo (ADMIN). */
    @PatchMapping("/{id}/fechar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> fechar(@PathVariable Integer id) {
        cicloService.fechar(id);
        return ResponseEntity.noContent().build();
    }

    /** PATCH /api/ciclos/{id}/reabrir → Reabre o ciclo (ADMIN). */
    @PatchMapping("/{id}/reabrir")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reabrir(@PathVariable Integer id) {
        cicloService.reabrir(id);
        return ResponseEntity.noContent().build();
    }
}
