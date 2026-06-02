package com.softgroup.softgroup.api.service;

import com.softgroup.softgroup.api.model.Softskill;
import com.softgroup.softgroup.api.repository.SoftskillRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** Service de Softskill — CRUD simples para gerenciar as habilidades avaliadas. */
@Service
public class SoftskillService {

    private final SoftskillRepository softskillRepository;

    public SoftskillService(SoftskillRepository softskillRepository) {
        this.softskillRepository = softskillRepository;
    }

    public List<Softskill> listarTodas() {
        return softskillRepository.findAllByOrderByNome();
    }

    public Softskill buscarPorId(Integer id) {
        return softskillRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Softskill não encontrada"));
    }

    public Softskill criar(Softskill softskill) {
        return softskillRepository.save(softskill);
    }

    public Softskill atualizar(Integer id, Softskill dados) {
        Softskill softskill = buscarPorId(id);
        softskill.setNome(dados.getNome());
        softskill.setDescricao(dados.getDescricao());
        return softskillRepository.save(softskill);
    }

    public void excluir(Integer id) {
        buscarPorId(id); // verifica se existe antes de excluir
        softskillRepository.deleteById(id);
    }
}
