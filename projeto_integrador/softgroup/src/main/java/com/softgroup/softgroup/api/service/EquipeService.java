package com.softgroup.softgroup.api.service;

import com.softgroup.softgroup.api.model.Equipe;
import com.softgroup.softgroup.api.repository.EquipeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EquipeService {

    private final EquipeRepository equipeRepository;

    public EquipeService(EquipeRepository equipeRepository) {
        this.equipeRepository = equipeRepository;
    }

    public List<Equipe> listarTodas() {
        return equipeRepository.buscarTodas();
    }

    public Equipe buscarPorId(Integer id) {
        return equipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipe não encontrada"));
    }

    public List<Equipe> buscarPorUsuario(Integer idUsuario) {
        return equipeRepository.buscarPorUsuario(idUsuario);
    }

    public Equipe criar(Equipe equipe) {
        return equipeRepository.save(equipe);
    }

    public Equipe atualizar(Integer id, Equipe dados) {
        Equipe equipe = buscarPorId(id);
        equipe.setNome(dados.getNome());
        return equipeRepository.save(equipe);
    }

    public void excluir(Integer id) {
        buscarPorId(id);
        equipeRepository.deleteById(id);
    }
}
