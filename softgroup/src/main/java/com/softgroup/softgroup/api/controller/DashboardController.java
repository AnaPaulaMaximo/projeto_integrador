package com.softgroup.softgroup.api.controller;

import com.softgroup.softgroup.api.dto.DashboardDTO;
import com.softgroup.softgroup.api.dto.ResultadoSoftskillDTO;
import com.softgroup.softgroup.api.model.Usuario;
import com.softgroup.softgroup.api.service.AcessoService;
import com.softgroup.softgroup.api.service.DashboardService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller de Dashboard — visualização de desempenho.
 *
 * Dois endpoints:
 *  - /meu/ciclo/{id}        → o próprio colaborador vê seu dashboard
 *  - /colaborador/{id}/ciclo/{id} → ADMIN ou LIDER vê o de qualquer um
 */
@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("isAuthenticated()")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AcessoService acessoService;

    public DashboardController(DashboardService dashboardService, AcessoService acessoService) {
        this.dashboardService = dashboardService;
        this.acessoService = acessoService;
    }

    /** GET /api/dashboard/meu/ciclo/{id} → Dashboard do usuário logado. */
    @GetMapping("/meu/ciclo/{idCiclo}")
    public ResponseEntity<DashboardDTO> meuDashboard(@PathVariable Integer idCiclo, HttpSession session) {
        Usuario logado = acessoService.obterUsuarioLogado(session);
        return ResponseEntity.ok(dashboardService.gerarDashboardColaborador(logado.getIdUsuario(), idCiclo));
    }

    /** GET /api/dashboard/colaborador/{id}/ciclo/{id} → Dashboard de qualquer colaborador (ADMIN/LIDER). */
    @GetMapping("/colaborador/{idUsuario}/ciclo/{idCiclo}")
    @PreAuthorize("hasAnyRole('ADMIN','LIDER')")
    public ResponseEntity<DashboardDTO> dashboardColaborador(@PathVariable Integer idUsuario,
                                                              @PathVariable Integer idCiclo,
                                                              HttpSession session) {
        Usuario logado = acessoService.obterUsuarioLogado(session);
        acessoService.validarAcessoAoDesempenho(logado, idUsuario);
        return ResponseEntity.ok(dashboardService.gerarDashboardColaborador(idUsuario, idCiclo));
    }

    /** GET /api/dashboard/equipe/{id}/ciclo/{id} → Resumo agregado por soft skill da equipe. */
    @GetMapping("/equipe/{idEquipe}/ciclo/{idCiclo}")
    public ResponseEntity<List<ResultadoSoftskillDTO>> dashboardEquipe(@PathVariable Integer idEquipe,
                                                                       @PathVariable Integer idCiclo,
                                                                       HttpSession session) {
        Usuario logado = acessoService.obterUsuarioLogado(session);
        acessoService.validarAcessoAEquipe(logado, idEquipe);
        return ResponseEntity.ok(dashboardService.gerarResumoEquipe(idEquipe, idCiclo));
    }
}
