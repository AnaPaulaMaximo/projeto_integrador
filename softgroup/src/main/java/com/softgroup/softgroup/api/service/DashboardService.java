package com.softgroup.softgroup.api.service;

import com.softgroup.softgroup.api.dto.DashboardDTO;
import com.softgroup.softgroup.api.dto.ResultadoSoftskillDTO;
import com.softgroup.softgroup.api.model.Ciclo;
import com.softgroup.softgroup.api.model.Softskill;
import com.softgroup.softgroup.api.model.Usuario;
import com.softgroup.softgroup.api.repository.AvaliacaoRepository;
import com.softgroup.softgroup.api.repository.CicloRepository;
import com.softgroup.softgroup.api.repository.SoftskillRepository;
import com.softgroup.softgroup.api.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CicloRepository cicloRepository;
    private final SoftskillRepository softskillRepository;
    private final AvaliacaoService avaliacaoService;
    private final NivelAvaliacaoService nivelService;

    public DashboardService(AvaliacaoRepository avaliacaoRepository,
                            UsuarioRepository usuarioRepository,
                            CicloRepository cicloRepository,
                            SoftskillRepository softskillRepository,
                            AvaliacaoService avaliacaoService,
                            NivelAvaliacaoService nivelService) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.cicloRepository = cicloRepository;
        this.softskillRepository = softskillRepository;
        this.avaliacaoService = avaliacaoService;
        this.nivelService = nivelService;
    }

    public DashboardDTO gerarDashboardColaborador(Integer idUsuario, Integer idCiclo) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        Ciclo ciclo = cicloRepository.findById(idCiclo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ciclo não encontrado"));

        List<ResultadoSoftskillDTO> resultados = avaliacaoService.buscarResultadosDoColaborador(idUsuario, idCiclo);

        Double mediaGeral = resultados.stream()
                .filter(r -> r.getMedia() != null)
                .mapToDouble(ResultadoSoftskillDTO::getMedia)
                .average()
                .orElse(0.0);

        NivelAvaliacaoService.InfoNivel infoGeral = resultados.isEmpty()
                ? new NivelAvaliacaoService.InfoNivel("CINZA", "Sem avaliação")
                : nivelService.buscarNivel(mediaGeral);

        List<DashboardDTO.HistoricoItemDTO> historico = buildHistorico(idUsuario);

        DashboardDTO dashboard = new DashboardDTO();
        dashboard.setIdUsuario(idUsuario);
        dashboard.setNomeUsuario(usuario.getNome());
        dashboard.setIdCiclo(idCiclo);
        dashboard.setNomeCiclo(ciclo.getNome());
        dashboard.setMediaGeral(mediaGeral);
        dashboard.setCorGeral(infoGeral.cor());
        dashboard.setNivelGeral(infoGeral.nome());
        dashboard.setResultadosPorSoftskill(resultados);
        dashboard.setHistorico(historico);

        return dashboard;
    }

    public List<ResultadoSoftskillDTO> gerarResumoEquipe(Integer idEquipe, Integer idCiclo) {
        List<Object[]> rows = avaliacaoRepository.mediaPorSoftskillDaEquipe(idEquipe, idCiclo);
        List<ResultadoSoftskillDTO> resultados = new ArrayList<>();

        for (Object[] row : rows) {
            Integer idSoftskill = (Integer) row[0];
            Double media = row[1] != null ? ((Number) row[1]).doubleValue() : null;
            Long total = row[2] != null ? ((Number) row[2]).longValue() : 0L;

            Softskill softskill = softskillRepository.findById(idSoftskill).orElse(null);
            String nomeSoftskill = softskill != null ? softskill.getNome() : "Desconhecida";
            NivelAvaliacaoService.InfoNivel info = nivelService.buscarNivel(media);

            resultados.add(new ResultadoSoftskillDTO(
                    idSoftskill,
                    nomeSoftskill,
                    "GERAL",
                    media,
                    total,
                    info.cor(),
                    info.nome()
            ));
        }

        return resultados;
    }

    private List<DashboardDTO.HistoricoItemDTO> buildHistorico(Integer idUsuario) {
        List<Object[]> medias = avaliacaoRepository.historicoMediasPorCiclo(idUsuario);
        Map<Integer, Double> mediaPorCiclo = medias.stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> row[1] != null ? ((Number) row[1]).doubleValue() : null
                ));

        List<Ciclo> ciclos = cicloRepository.findAllByOrderByDataInicioDesc();
        List<DashboardDTO.HistoricoItemDTO> historico = new ArrayList<>();

        for (Ciclo c : ciclos) {
            Double media = mediaPorCiclo.get(c.getIdCiclo());
            historico.add(new DashboardDTO.HistoricoItemDTO(
                    c.getIdCiclo(),
                    c.getNome(),
                    c.getDataInicio() != null ? c.getDataInicio().toString() : null,
                    media,
                    nivelService.buscarCor(media)
            ));
        }

        return historico;
    }
}
