package com.softgroup.softgroup.api.repository;

import com.softgroup.softgroup.api.model.Equipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipeRepository extends JpaRepository<Equipe, Integer> {

    @Query(value = "SELECT * FROM equipe ORDER BY nome", nativeQuery = true)
    List<Equipe> buscarTodas();

    @Query(value = "SELECT * FROM equipe WHERE id_equipe IN (SELECT id_equipe FROM usuario_equipe WHERE id_usuario = :idUsuario) ORDER BY nome",
            nativeQuery = true)
    List<Equipe> buscarPorUsuario(@Param("idUsuario") Integer idUsuario);
}
