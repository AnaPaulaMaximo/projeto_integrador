package com.softgroup.softgroup.api.controller;

import com.softgroup.softgroup.api.dto.RankingItemDTO;
import com.softgroup.softgroup.api.model.Usuario;
import com.softgroup.softgroup.api.service.AcessoService;
import com.softgroup.softgroup.api.service.RankingService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller de Ranking.
 *
 * Ranking geral → ADMIN ou LIDER.
 * Ranking por equipe → qualquer autenticado (colaborador pode ver sua equipe).
 */
@RestController
@RequestMapping("/api/ranking")
public class RankingController {

    private final RankingService rankingService;
    private final AcessoService acessoService;

    public RankingController(RankingService rankingService, AcessoService acessoService) {
        this.rankingService = rankingService;
        this.acessoService = acessoService;
    }

    @GetMapping("/ciclo/{idCiclo}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RankingItemDTO>> rankingGeral(@PathVariable Integer idCiclo) {
        return ResponseEntity.ok(rankingService.rankingGeral(idCiclo));
    }

    @GetMapping("/ciclo/{idCiclo}/equipe/{idEquipe}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RankingItemDTO>> rankingPorEquipe(@PathVariable Integer idCiclo,
                                                                  @PathVariable Integer idEquipe,
                                                                  HttpSession session) {
        Usuario logado = acessoService.obterUsuarioLogado(session);
        acessoService.validarAcessoAEquipe(logado, idEquipe);
        return ResponseEntity.ok(rankingService.rankingPorEquipe(idCiclo, idEquipe));
    }
}
