package com.softgroup.softgroup.api.service;

import com.softgroup.softgroup.api.dto.RankingItemDTO;
import com.softgroup.softgroup.api.model.Usuario;
import com.softgroup.softgroup.api.repository.AvaliacaoRepository;
import com.softgroup.softgroup.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RankingService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NivelAvaliacaoService nivelService;

    public RankingService(AvaliacaoRepository avaliacaoRepository,
                          UsuarioRepository usuarioRepository,
                          NivelAvaliacaoService nivelService) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.nivelService = nivelService;
    }

    public List<RankingItemDTO> rankingGeral(Integer idCiclo) {
        List<Object[]> rows = avaliacaoRepository.rankingGeral(idCiclo);
        return mapearRanking(rows, idCiclo);
    }

    public List<RankingItemDTO> rankingPorEquipe(Integer idCiclo, Integer idEquipe) {
        List<Object[]> rows = avaliacaoRepository.rankingPorEquipe(idCiclo, idEquipe);
        return mapearRanking(rows, idCiclo);
    }

    private List<RankingItemDTO> mapearRanking(List<Object[]> rows, Integer idCiclo) {
        Map<Integer, Usuario> usuariosCache = new HashMap<>();
        List<RankingItemDTO> ranking = new ArrayList<>();
        int posicao = 1;

        for (Object[] row : rows) {
            Integer idUsuario = (Integer) row[0];
            Double media = row[1] != null ? ((Number) row[1]).doubleValue() : null;
            Long total = row[2] != null ? ((Number) row[2]).longValue() : 0L;

            Usuario usuario = usuariosCache.computeIfAbsent(idUsuario,
                    id -> usuarioRepository.findById(id).orElse(null));

            if (usuario == null || !"ATIVO".equals(usuario.getStatus())) {
                continue;
            }

            Map<String, Double> mediasPorTipo = new HashMap<>();
            avaliacaoRepository.mediaPorTipoDoColaborador(idUsuario, idCiclo).forEach(tipoRow -> {
                String tipo = (String) tipoRow[0];
                Double valor = tipoRow[1] != null ? ((Number) tipoRow[1]).doubleValue() : null;
                mediasPorTipo.put(tipo, valor);
            });

            NivelAvaliacaoService.InfoNivel info = nivelService.buscarNivel(media);

            ranking.add(new RankingItemDTO(
                    posicao++,
                    idUsuario,
                    usuario.getNome(),
                    usuario.getCargo(),
                    mediasPorTipo.get("AUTO"),
                    mediasPorTipo.get("LIDER"),
                    mediasPorTipo.get("360"),
                    media,
                    total,
                    info.cor(),
                    info.nome()
            ));
        }
        return ranking;
    }
}
