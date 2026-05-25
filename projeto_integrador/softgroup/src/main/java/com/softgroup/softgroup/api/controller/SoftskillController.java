package com.softgroup.softgroup.api.controller;

import com.softgroup.softgroup.api.model.Softskill;
import com.softgroup.softgroup.api.service.SoftskillService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller de Softskills — gerenciamento das habilidades avaliadas.
 *
 * Leitura (GET)  → qualquer usuário autenticado.
 * Escrita (POST/PUT/DELETE) → apenas ADMIN.
 */
@RestController
@RequestMapping("/api/softskills")
public class SoftskillController {

    private final SoftskillService softskillService;

    public SoftskillController(SoftskillService softskillService) {
        this.softskillService = softskillService;
    }

    /** GET /api/softskills → Lista todas as softskills. */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Softskill>> listarTodas() {
        return ResponseEntity.ok(softskillService.listarTodas());
    }

    /** GET /api/softskills/{id} → Busca softskill por ID. */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Softskill> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(softskillService.buscarPorId(id));
    }

    /** POST /api/softskills → Cria uma nova softskill (ADMIN). */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Softskill> criar(@RequestBody Softskill softskill) {
        return ResponseEntity.status(HttpStatus.CREATED).body(softskillService.criar(softskill));
    }

    /** PUT /api/softskills/{id} → Atualiza uma softskill (ADMIN). */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Softskill> atualizar(@PathVariable Integer id, @RequestBody Softskill softskill) {
        return ResponseEntity.ok(softskillService.atualizar(id, softskill));
    }

    /** DELETE /api/softskills/{id} → Exclui uma softskill (ADMIN). */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        softskillService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
