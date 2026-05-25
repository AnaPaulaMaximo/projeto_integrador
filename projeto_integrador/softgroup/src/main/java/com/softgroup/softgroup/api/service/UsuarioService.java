package com.softgroup.softgroup.api.service;

import com.softgroup.softgroup.api.model.Usuario;
import com.softgroup.softgroup.api.repository.EquipeRepository;
import com.softgroup.softgroup.api.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EquipeRepository equipeRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, EquipeRepository equipeRepository) {
        this.usuarioRepository = usuarioRepository;
        this.equipeRepository = equipeRepository;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.buscarTodosOrdenados();
    }

    public List<Usuario> listarPorPerfil(String tipoPerfil) {
        return usuarioRepository.buscarPorPerfil(tipoPerfil.toUpperCase());
    }

    public List<Usuario> listarPorEquipe(Integer idEquipe) {
        return usuarioRepository.buscarPorEquipe(idEquipe);
    }

    public List<Usuario> listarColegas(Integer idUsuario) {
        return usuarioRepository.buscarColegas(idUsuario);
    }

    public Usuario buscarPorId(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    public Usuario criar(Usuario usuario) {
        String email = normalizarEmail(usuario.getEmail());
        usuarioRepository.findByEmail(email).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        });
        usuario.setNome(usuario.getNome().trim());
        usuario.setEmail(email);
        usuario.setCargo(usuario.getCargo().trim());
        usuario.setTipoPerfil(usuario.getTipoPerfil().trim().toUpperCase());
        usuario.setStatus("ATIVO");
        return usuarioRepository.save(usuario);
    }

    public Usuario atualizar(Integer id, Usuario dados) {
        Usuario usuario = buscarPorId(id);
        usuario.setNome(dados.getNome().trim());
        usuario.setCargo(dados.getCargo().trim());
        usuario.setTipoPerfil(dados.getTipoPerfil().trim().toUpperCase());
        String novoEmail = normalizarEmail(dados.getEmail());
        if (novoEmail != null && !novoEmail.equals(usuario.getEmail())) {
            usuarioRepository.findByEmail(novoEmail).ifPresent(u -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
            });
            usuario.setEmail(novoEmail);
        }
        return usuarioRepository.save(usuario);
    }

    public void inativar(Integer id) {
        Usuario usuario = buscarPorId(id);
        usuario.setStatus("INATIVO");
        usuarioRepository.save(usuario);
    }

    public void ativar(Integer id) {
        Usuario usuario = buscarPorId(id);
        usuario.setStatus("ATIVO");
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void adicionarAEquipe(Integer idUsuario, Integer idEquipe) {
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
        }
        if (!equipeRepository.existsById(idEquipe)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipe não encontrada");
        }
        if (usuarioRepository.participaDaEquipe(idUsuario, idEquipe)) {
            return;
        }
        usuarioRepository.adicionarAEquipe(idUsuario, idEquipe);
    }

    @Transactional
    public void removerDaEquipe(Integer idUsuario, Integer idEquipe) {
        usuarioRepository.removerDaEquipe(idUsuario, idEquipe);
    }

    private String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
