package com.softgroup.softgroup.api.service;

import com.softgroup.softgroup.api.model.Ciclo;
import com.softgroup.softgroup.api.repository.CicloRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

/**
 * Service de Ciclo — gerencia os ciclos de avaliação.
 *
 * Regras de negócio:
 *  - Data fim deve ser posterior à data início
 *  - Ciclo fechado não pode ser editado
 *  - Ciclo já aberto não pode ser reaberto (e vice-versa)
 */
@Service
public class CicloService {

    private final CicloRepository cicloRepository;

    public CicloService(CicloRepository cicloRepository) {
        this.cicloRepository = cicloRepository;
    }

    /** Lista todos os ciclos, do mais recente ao mais antigo. */
    public List<Ciclo> listarTodos() {
        return cicloRepository.findAllByOrderByDataInicioDesc();
    }

    /** Lista apenas ciclos com status ABERTO. */
    public List<Ciclo> listarAbertos() {
        return cicloRepository.findByStatusOrderByDataInicioDesc("ABERTO");
    }

    /** Retorna o ciclo aberto mais recente (se houver). */
    public Optional<Ciclo> buscarUltimoAberto() {
        return cicloRepository.findFirstByStatusOrderByDataInicioDesc("ABERTO");
    }

    /** Busca por ID — lança 404 se não encontrar. */
    public Ciclo buscarPorId(Integer id) {
        return cicloRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ciclo não encontrado"));
    }

    /** Cria um novo ciclo (sempre começa com status ABERTO). */
    public Ciclo criar(Ciclo ciclo) {
        if (ciclo.getDataFim().isBefore(ciclo.getDataInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data fim deve ser posterior à data início");
        }
        ciclo.setStatus("ABERTO");
        return cicloRepository.save(ciclo);
    }

    /** Atualiza um ciclo (apenas se ainda estiver ABERTO). */
    public Ciclo atualizar(Integer id, Ciclo dados) {
        Ciclo ciclo = buscarPorId(id);
        if ("FECHADO".equals(ciclo.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ciclo fechado não pode ser editado");
        }
        ciclo.setNome(dados.getNome());
        ciclo.setDataInicio(dados.getDataInicio());
        ciclo.setDataFim(dados.getDataFim());
        return cicloRepository.save(ciclo);
    }

    /** Fecha um ciclo — impede novas avaliações. */
    public void fechar(Integer id) {
        Ciclo ciclo = buscarPorId(id);
        if ("FECHADO".equals(ciclo.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ciclo já está fechado");
        }
        ciclo.setStatus("FECHADO");
        cicloRepository.save(ciclo);
    }

    /** Reabre um ciclo que estava fechado. */
    public void reabrir(Integer id) {
        Ciclo ciclo = buscarPorId(id);
        if ("ABERTO".equals(ciclo.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ciclo já está aberto");
        }
        ciclo.setStatus("ABERTO");
        cicloRepository.save(ciclo);
    }
}
