package com.softgroup.softgroup.api.service;

import com.softgroup.softgroup.api.model.Usuario;
import com.softgroup.softgroup.api.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AcessoService {

    private final UsuarioRepository usuarioRepository;

    public AcessoService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario obterUsuarioLogado(HttpSession session) {
        Usuario usuarioSessao = (Usuario) session.getAttribute("usuarioLogado");
        if (usuarioSessao == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Não autenticado");
        }

        return usuarioRepository.findById(usuarioSessao.getIdUsuario())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário da sessão não encontrado"));
    }

    public void validarAcessoAEquipe(Usuario logado, Integer idEquipe) {
        if (isAdmin(logado)) {
            return;
        }
        if (!usuarioRepository.participaDaEquipe(logado.getIdUsuario(), idEquipe)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado para esta equipe");
        }
    }

    public void validarAcessoAoUsuario(Usuario logado, Integer idUsuario) {
        if (isAdmin(logado) || logado.getIdUsuario().equals(idUsuario)) {
            return;
        }
        if (!usuarioRepository.compartilhaEquipe(logado.getIdUsuario(), idUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado para este usuário");
        }
    }

    public void validarAcessoAoDesempenho(Usuario logado, Integer idUsuario) {
        if (isAdmin(logado) || logado.getIdUsuario().equals(idUsuario)) {
            return;
        }
        if (isLider(logado) && usuarioRepository.compartilhaEquipe(logado.getIdUsuario(), idUsuario)) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode visualizar este desempenho");
    }

    public boolean podeAvaliarComoLider(Usuario logado, Integer idAvaliado) {
        return isAdmin(logado) || (isLider(logado) && usuarioRepository.compartilhaEquipe(logado.getIdUsuario(), idAvaliado));
    }

    public boolean compartilhaEquipe(Usuario usuarioA, Integer idUsuarioB) {
        return usuarioRepository.compartilhaEquipe(usuarioA.getIdUsuario(), idUsuarioB);
    }

    public boolean isAdmin(Usuario usuario) {
        return "ADMIN".equalsIgnoreCase(usuario.getTipoPerfil());
    }

    public boolean isLider(Usuario usuario) {
        return "LIDER".equalsIgnoreCase(usuario.getTipoPerfil());
    }
}
