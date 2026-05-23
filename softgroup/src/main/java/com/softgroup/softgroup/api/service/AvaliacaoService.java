package com.softgroup.softgroup.api.service;

import com.softgroup.softgroup.api.dto.AvaliacaoRequestDTO;
import com.softgroup.softgroup.api.dto.ColaboradorPendenteDTO;
import com.softgroup.softgroup.api.dto.ResultadoSoftskillDTO;
import com.softgroup.softgroup.api.model.*;
import com.softgroup.softgroup.api.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final CicloRepository cicloRepository;
    private final UsuarioRepository usuarioRepository;
    private final SoftskillRepository softskillRepository;
    private final NivelAvaliacaoService nivelService;
    private final AcessoService acessoService;

    public AvaliacaoService(AvaliacaoRepository avaliacaoRepository,
                            CicloRepository cicloRepository,
                            UsuarioRepository usuarioRepository,
                            SoftskillRepository softskillRepository,
                            NivelAvaliacaoService nivelService,
                            AcessoService acessoService) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.cicloRepository = cicloRepository;
        this.usuarioRepository = usuarioRepository;
        this.softskillRepository = softskillRepository;
        this.nivelService = nivelService;
        this.acessoService = acessoService;
    }

    public Avaliacao registrar(Usuario logado, AvaliacaoRequestDTO dto) {
        String tipo = dto.getTipo().trim().toUpperCase();
        Ciclo ciclo = cicloRepository.findById(dto.getIdCiclo())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ciclo não encontrado"));

        if ("FECHADO".equals(ciclo.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O ciclo está fechado");
        }

        if (!usuarioRepository.existsById(dto.getIdAvaliado())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Avaliado não encontrado");
        }

        if (!softskillRepository.existsById(dto.getIdSoftskill())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Softskill não encontrada");
        }

        if ("AUTO".equals(tipo)) {
            if (!logado.getIdUsuario().equals(dto.getIdAvaliado())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Autoavaliação deve ser feita pelo próprio usuário");
            }
        } else if ("LIDER".equals(tipo)) {
            if (!acessoService.podeAvaliarComoLider(logado, dto.getIdAvaliado())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente liderança da equipe pode registrar esta avaliação");
            }
            if (logado.getIdUsuario().equals(dto.getIdAvaliado())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avaliação de liderança não pode ser autoaplicada");
            }
        } else if ("360".equals(tipo)) {
            if (logado.getIdUsuario().equals(dto.getIdAvaliado())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avaliação 360° deve ser feita para outra pessoa");
            }
            if (!acessoService.compartilhaEquipe(logado, dto.getIdAvaliado())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Avaliação 360° só pode ser feita entre membros da mesma equipe");
            }
        }

        long existente = avaliacaoRepository.contarDuplicata(
                logado.getIdUsuario(), dto.getIdAvaliado(), dto.getIdSoftskill(), dto.getIdCiclo(), tipo);
        if (existente > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Avaliação já registrada");
        }

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setIdAvaliador(logado.getIdUsuario());
        avaliacao.setIdAvaliado(dto.getIdAvaliado());
        avaliacao.setIdSoftskill(dto.getIdSoftskill());
        avaliacao.setIdCiclo(dto.getIdCiclo());
        avaliacao.setNota(dto.getNota());
        avaliacao.setTipo(tipo);
        avaliacao.setAnonimato("360".equals(tipo) && dto.getAnonimato() != null && dto.getAnonimato());
        avaliacao.setData(LocalDateTime.now());

        return avaliacaoRepository.save(avaliacao);
    }

    public List<ResultadoSoftskillDTO> buscarResultadosDoColaborador(Integer idAvaliado, Integer idCiclo) {
        List<Object[]> rows = avaliacaoRepository.mediaPorSoftskillETipo(idAvaliado, idCiclo);
        List<ResultadoSoftskillDTO> resultados = new ArrayList<>();

        for (Object[] row : rows) {
            Integer idSoftskill = (Integer) row[0];
            String tipo = (String) row[1];
            Double media = row[2] != null ? ((Number) row[2]).doubleValue() : null;
            Long total = row[3] != null ? ((Number) row[3]).longValue() : 0L;

            Softskill softskill = softskillRepository.findById(idSoftskill).orElse(null);
            String nomeSoftskill = softskill != null ? softskill.getNome() : "Desconhecida";

            NivelAvaliacaoService.InfoNivel info = nivelService.buscarNivel(media);

            resultados.add(new ResultadoSoftskillDTO(
                    idSoftskill, nomeSoftskill, tipo, media, total, info.cor(), info.nome()));
        }

        return resultados;
    }

    public List<Avaliacao> buscarPorAvaliadorECiclo(Integer idAvaliador, Integer idCiclo) {
        return avaliacaoRepository.buscarPorAvaliadorECiclo(idAvaliador, idCiclo);
    }

    public List<ColaboradorPendenteDTO> buscarPendentes(Integer idCiclo, Usuario logado) {
        return usuarioRepository.buscarPendentes(idCiclo).stream()
                .filter(u -> acessoService.isAdmin(logado)
                        || acessoService.compartilhaEquipe(logado, u.getIdUsuario()))
                .map(u -> new ColaboradorPendenteDTO(u.getIdUsuario(), u.getNome(), u.getEmail()))
                .toList();
    }
}
