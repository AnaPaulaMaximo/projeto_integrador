package com.softgroup.softgroup.api.controller;

import com.softgroup.softgroup.api.dto.AvaliacaoRequestDTO;
import com.softgroup.softgroup.api.dto.ColaboradorPendenteDTO;
import com.softgroup.softgroup.api.dto.ResultadoSoftskillDTO;
import com.softgroup.softgroup.api.model.Avaliacao;
import com.softgroup.softgroup.api.model.Usuario;
import com.softgroup.softgroup.api.service.AcessoService;
import com.softgroup.softgroup.api.service.AvaliacaoService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller de Avaliações.
 *
 * ─── O QUE É UM @RestController? ───────────────────────────────
 * Combina @Controller + @ResponseBody. Significa que cada método
 * retorna dados (JSON), não uma página HTML.
 *
 * ─── O QUE É @RequestMapping? ──────────────────────────────────
 * Define o prefixo da URL. Todos os endpoints deste controller
 * começam com "/api/avaliacoes".
 *
 * ─── O QUE É ResponseEntity? ───────────────────────────────────
 * É a resposta HTTP completa: status code + corpo (body) + headers.
 * Ex: ResponseEntity.status(201).body(dados) → retorna 201 Created com JSON.
 *
 * ─── O QUE É @PreAuthorize? ────────────────────────────────────
 * Controla quem pode acessar o endpoint.
 * "isAuthenticated()" → qualquer usuário logado.
 * "hasRole('ADMIN')" → apenas administradores.
 */
@RestController
@RequestMapping("/api/avaliacoes")
@PreAuthorize("isAuthenticated()")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;
    private final AcessoService acessoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService, AcessoService acessoService) {
        this.avaliacaoService = avaliacaoService;
        this.acessoService = acessoService;
    }

    /**
     * POST /api/avaliacoes → Registra uma nova avaliação.
     * O avaliador é o usuário logado (pego da sessão).
     * @Valid valida o DTO antes de processar (verifica @NotNull, @Min, etc.).
     */
    @PostMapping
    public ResponseEntity<Avaliacao> registrar(@Valid @RequestBody AvaliacaoRequestDTO dto,
                                               HttpSession session) {
        Usuario logado = acessoService.obterUsuarioLogado(session);
        Avaliacao avaliacao = avaliacaoService.registrar(logado, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(avaliacao);
    }

    @GetMapping("/minhas/ciclo/{idCiclo}")
    public ResponseEntity<List<Avaliacao>> minhasAvaliacoes(@PathVariable Integer idCiclo, HttpSession session) {
        Usuario logado = acessoService.obterUsuarioLogado(session);
        return ResponseEntity.ok(avaliacaoService.buscarPorAvaliadorECiclo(logado.getIdUsuario(), idCiclo));
    }

    /**
     * GET /api/avaliacoes/resultados/{id}/ciclo/{ciclo} → Resultados de um colaborador.
     * Colaborador só pode ver os próprios resultados (403 Forbidden se tentar ver de outro).
     */
    @GetMapping("/resultados/{idAvaliado}/ciclo/{idCiclo}")
    public ResponseEntity<List<ResultadoSoftskillDTO>> resultados(
            @PathVariable Integer idAvaliado,
            @PathVariable Integer idCiclo,
            HttpSession session) {

        Usuario logado = acessoService.obterUsuarioLogado(session);
        acessoService.validarAcessoAoDesempenho(logado, idAvaliado);
        return ResponseEntity.ok(avaliacaoService.buscarResultadosDoColaborador(idAvaliado, idCiclo));
    }

    /**
     * GET /api/avaliacoes/pendentes/ciclo/{ciclo} → Quem não foi avaliado ainda.
     * Visível apenas para ADMIN e LIDER.
     */
    @GetMapping("/pendentes/ciclo/{idCiclo}")
    @PreAuthorize("hasAnyRole('ADMIN','LIDER')")
    public ResponseEntity<List<ColaboradorPendenteDTO>> pendentes(@PathVariable Integer idCiclo,
                                                                  HttpSession session) {
        Usuario logado = acessoService.obterUsuarioLogado(session);
        return ResponseEntity.ok(avaliacaoService.buscarPendentes(idCiclo, logado));
    }
}
