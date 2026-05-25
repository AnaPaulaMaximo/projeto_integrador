package com.softgroup.softgroup.api.repository;

import com.softgroup.softgroup.api.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Integer> {

    @Query(value = "SELECT * FROM avaliacao WHERE id_avaliado = :idAvaliado AND id_ciclo = :idCiclo",
            nativeQuery = true)
    List<Avaliacao> buscarPorAvaliadoECiclo(@Param("idAvaliado") Integer idAvaliado,
                                             @Param("idCiclo") Integer idCiclo);

    @Query(value = "SELECT * FROM avaliacao WHERE id_avaliador = :idAvaliador AND id_ciclo = :idCiclo",
            nativeQuery = true)
    List<Avaliacao> buscarPorAvaliadorECiclo(@Param("idAvaliador") Integer idAvaliador,
                                             @Param("idCiclo") Integer idCiclo);

    @Query(value = "SELECT COUNT(*) FROM avaliacao WHERE id_avaliador = :idAvaliador AND id_avaliado = :idAvaliado AND id_softskill = :idSoftskill AND id_ciclo = :idCiclo AND tipo = :tipo",
            nativeQuery = true)
    long contarDuplicata(@Param("idAvaliador") Integer idAvaliador,
                         @Param("idAvaliado") Integer idAvaliado,
                         @Param("idSoftskill") Integer idSoftskill,
                         @Param("idCiclo") Integer idCiclo,
                         @Param("tipo") String tipo);

    @Query(value = "SELECT id_softskill, tipo, ROUND(AVG(nota), 2) AS media, COUNT(*) AS total FROM avaliacao WHERE id_avaliado = :idAvaliado AND id_ciclo = :idCiclo GROUP BY id_softskill, tipo",
            nativeQuery = true)
    List<Object[]> mediaPorSoftskillETipo(@Param("idAvaliado") Integer idAvaliado,
                                           @Param("idCiclo") Integer idCiclo);

    @Query(value = """
            SELECT a.id_softskill, ROUND(AVG(a.nota), 2) AS media, COUNT(*) AS total
            FROM avaliacao a
            WHERE a.id_ciclo = :idCiclo
              AND a.id_avaliado IN (
                  SELECT ue.id_usuario
                  FROM usuario_equipe ue
                  WHERE ue.id_equipe = :idEquipe
              )
            GROUP BY a.id_softskill
            ORDER BY a.id_softskill
            """,
            nativeQuery = true)
    List<Object[]> mediaPorSoftskillDaEquipe(@Param("idEquipe") Integer idEquipe,
                                             @Param("idCiclo") Integer idCiclo);

    @Query(value = "SELECT id_avaliado, ROUND(AVG(nota), 2) AS media, COUNT(*) AS total FROM avaliacao WHERE id_ciclo = :idCiclo GROUP BY id_avaliado ORDER BY media DESC",
            nativeQuery = true)
    List<Object[]> rankingGeral(@Param("idCiclo") Integer idCiclo);

    @Query(value = "SELECT a.id_avaliado, ROUND(AVG(a.nota), 2) AS media, COUNT(*) AS total FROM avaliacao a WHERE a.id_ciclo = :idCiclo AND a.id_avaliado IN (SELECT id_usuario FROM usuario_equipe WHERE id_equipe = :idEquipe) GROUP BY a.id_avaliado ORDER BY media DESC",
            nativeQuery = true)
    List<Object[]> rankingPorEquipe(@Param("idCiclo") Integer idCiclo,
                                     @Param("idEquipe") Integer idEquipe);

    @Query(value = "SELECT id_ciclo, ROUND(AVG(nota), 2) AS media FROM avaliacao WHERE id_avaliado = :idAvaliado GROUP BY id_ciclo",
            nativeQuery = true)
    List<Object[]> historicoMediasPorCiclo(@Param("idAvaliado") Integer idAvaliado);

    @Query(value = "SELECT tipo, ROUND(AVG(nota), 2) AS media FROM avaliacao WHERE id_avaliado = :idAvaliado AND id_ciclo = :idCiclo GROUP BY tipo",
            nativeQuery = true)
    List<Object[]> mediaPorTipoDoColaborador(@Param("idAvaliado") Integer idAvaliado,
                                             @Param("idCiclo") Integer idCiclo);

    @Query(value = "SELECT DISTINCT id_avaliado FROM avaliacao WHERE id_ciclo = :idCiclo",
            nativeQuery = true)
    List<Integer> idsAvaliadosNoCiclo(@Param("idCiclo") Integer idCiclo);
}
