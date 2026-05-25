package com.softgroup.softgroup.api.service;

import com.softgroup.softgroup.api.model.NivelAvaliacao;
import com.softgroup.softgroup.api.repository.NivelAvaliacaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NivelAvaliacaoService {

    private final NivelAvaliacaoRepository nivelRepository;

    public NivelAvaliacaoService(NivelAvaliacaoRepository nivelRepository) {
        this.nivelRepository = nivelRepository;
    }

    public record InfoNivel(String cor, String nome) {}

    private static final InfoNivel SEM_AVALIACAO = new InfoNivel("CINZA", "Sem avaliação");

    public InfoNivel buscarNivel(Double media) {
        if (media == null) {
            return SEM_AVALIACAO;
        }
        return nivelRepository.buscarPorNota(media.intValue())
                .map(n -> new InfoNivel(n.getCor(), n.getNome()))
                .orElse(SEM_AVALIACAO);
    }

    public String buscarCor(Double media) {
        return buscarNivel(media).cor();
    }

    public List<NivelAvaliacao> listarTodos() {
        return nivelRepository.buscarTodos();
    }
}
