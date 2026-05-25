package com.softgroup.softgroup.api.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifica que as regras de @PreAuthorize estão amarradas:
 *  - sem sessão → 401
 *  - colaborador tentando endpoint de admin → 403
 *  - admin acessando endpoint de admin → 200
 */
@SpringBootTest
@ActiveProfiles("test")
class PermissaoControllerTest {

    @Autowired WebApplicationContext context;
    @Autowired FilterChainProxy springSecurityFilterChain;

    MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .addFilters(springSecurityFilterChain)
                .build();
    }

    private MockHttpSession login(String email) throws Exception {
        MvcResult res = mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\"}"))
            .andExpect(status().isOk())
            .andReturn();
        return (MockHttpSession) res.getRequest().getSession(false);
    }

    @Test
    void listarUsuariosSemSessaoRetorna401() throws Exception {
        mvc.perform(get("/api/usuarios")).andExpect(status().isUnauthorized());
    }

    @Test
    void colaboradorNaoListaTodosOsUsuarios() throws Exception {
        MockHttpSession session = login("ana@softgroup.com");
        mvc.perform(get("/api/usuarios").session(session))
            .andExpect(status().isForbidden());
    }

    @Test
    void adminListaTodosOsUsuarios() throws Exception {
        MockHttpSession session = login("admin@softgroup.com");
        mvc.perform(get("/api/usuarios").session(session))
            .andExpect(status().isOk());
    }

    @Test
    void colaboradorNaoVePendentes() throws Exception {
        MockHttpSession session = login("ana@softgroup.com");
        mvc.perform(get("/api/avaliacoes/pendentes/ciclo/1").session(session))
            .andExpect(status().isForbidden());
    }

    @Test
    void colaboradorAcessaProprioMe() throws Exception {
        MockHttpSession session = login("ana@softgroup.com");
        mvc.perform(get("/api/me").session(session))
            .andExpect(status().isOk());
    }
}
