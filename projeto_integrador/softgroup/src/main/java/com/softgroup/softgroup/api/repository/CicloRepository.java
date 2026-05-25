package com.softgroup.softgroup.api.repository;

import com.softgroup.softgroup.api.model.Ciclo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository de Ciclo de avaliação.
 *
 * findFirst... → retorna apenas o PRIMEIRO resultado (em vez de uma lista).
 * Útil quando queremos "o ciclo aberto mais recente".
 */
@Repository
public interface CicloRepository extends JpaRepository<Ciclo, Integer> {

    /** Todos os ciclos, do mais recente ao mais antigo. */
    List<Ciclo> findAllByOrderByDataInicioDesc();

    /** Apenas ciclos com status ABERTO, do mais recente ao mais antigo. */
    List<Ciclo> findByStatusOrderByDataInicioDesc(String status);

    /** O ciclo aberto mais recente (retorna Optional pois pode não haver nenhum). */
    Optional<Ciclo> findFirstByStatusOrderByDataInicioDesc(String status);
}
