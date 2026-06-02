package com.softgroup.softgroup.api.repository;

import com.softgroup.softgroup.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    @Query(value = "SELECT * FROM usuario WHERE LOWER(email) = LOWER(:email)", nativeQuery = true)
    Optional<Usuario> findByEmail(@Param("email") String email);

    @Query(value = "SELECT * FROM usuario ORDER BY nome", nativeQuery = true)
    List<Usuario> buscarTodosOrdenados();

    @Query(value = "SELECT * FROM usuario WHERE tipo_perfil = :tipoPerfil ORDER BY nome",
            nativeQuery = true)
    List<Usuario> buscarPorPerfil(@Param("tipoPerfil") String tipoPerfil);

    @Query(value = "SELECT * FROM usuario WHERE id_usuario IN (SELECT id_usuario FROM usuario_equipe WHERE id_equipe = :idEquipe) AND status = 'ATIVO' ORDER BY nome",
            nativeQuery = true)
    List<Usuario> buscarPorEquipe(@Param("idEquipe") Integer idEquipe);

    @Query(value = "SELECT * FROM usuario WHERE status = 'ATIVO' AND tipo_perfil = 'COLABORADOR' AND id_usuario NOT IN (SELECT DISTINCT id_avaliado FROM avaliacao WHERE id_ciclo = :idCiclo) ORDER BY nome",
            nativeQuery = true)
    List<Usuario> buscarPendentes(@Param("idCiclo") Integer idCiclo);

    /**
     * Colegas: membros das mesmas equipes do usuário (incluindo o próprio).
     * Se o usuário não pertence a nenhuma equipe, retorna lista vazia.
     */
    @Query(value = "SELECT DISTINCT u.* FROM usuario u " +
                   "JOIN usuario_equipe ue ON ue.id_usuario = u.id_usuario " +
                   "WHERE u.status = 'ATIVO' AND ue.id_equipe IN " +
                   "(SELECT id_equipe FROM usuario_equipe WHERE id_usuario = :idUsuario) " +
                   "ORDER BY u.nome",
            nativeQuery = true)
    List<Usuario> buscarColegas(@Param("idUsuario") Integer idUsuario);

    @Query(value = """
            SELECT COUNT(*) > 0
            FROM usuario_equipe
            WHERE id_usuario = :idUsuario AND id_equipe = :idEquipe
            """,
            nativeQuery = true)
    boolean participaDaEquipe(@Param("idUsuario") Integer idUsuario, @Param("idEquipe") Integer idEquipe);

    @Query(value = """
            SELECT COUNT(*) > 0
            FROM usuario_equipe ue1
            JOIN usuario_equipe ue2 ON ue1.id_equipe = ue2.id_equipe
            WHERE ue1.id_usuario = :idUsuarioA
              AND ue2.id_usuario = :idUsuarioB
            """,
            nativeQuery = true)
    boolean compartilhaEquipe(@Param("idUsuarioA") Integer idUsuarioA, @Param("idUsuarioB") Integer idUsuarioB);

    @Modifying
    @Query(value = "INSERT INTO usuario_equipe (id_usuario, id_equipe) VALUES (:idUsuario, :idEquipe)",
            nativeQuery = true)
    void adicionarAEquipe(@Param("idUsuario") Integer idUsuario, @Param("idEquipe") Integer idEquipe);

    @Modifying
    @Query(value = "DELETE FROM usuario_equipe WHERE id_usuario = :idUsuario AND id_equipe = :idEquipe",
            nativeQuery = true)
    void removerDaEquipe(@Param("idUsuario") Integer idUsuario, @Param("idEquipe") Integer idEquipe);
}
