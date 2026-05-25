package com.softgroup.softgroup.api.repository;

import com.softgroup.softgroup.api.model.NivelAvaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NivelAvaliacaoRepository extends JpaRepository<NivelAvaliacao, Integer> {

    @Query(value = "SELECT * FROM nivel_avaliacao ORDER BY faixa_min DESC", nativeQuery = true)
    List<NivelAvaliacao> buscarTodos();

    @Query(value = "SELECT * FROM nivel_avaliacao WHERE faixa_min <= :nota AND faixa_max >= :nota LIMIT 1",
            nativeQuery = true)
    Optional<NivelAvaliacao> buscarPorNota(@Param("nota") Integer nota);
}
