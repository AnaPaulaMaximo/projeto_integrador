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

@SpringBootTest
@ActiveProfiles("test")
class AvaliacaoFlowTest {

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
    void colaboradorListaCiclosAbertos() throws Exception {
        MockHttpSession session = login("ana@softgroup.com");
        mvc.perform(get("/api/ciclos/abertos").session(session))
            .andExpect(status().isOk());
    }

    @Test
    void colaboradorListaSoftskills() throws Exception {
        MockHttpSession session = login("ana@softgroup.com");
        mvc.perform(get("/api/softskills").session(session))
            .andExpect(status().isOk());
    }

    @Test
    void colaboradorListaSeusColegas() throws Exception {
        MockHttpSession session = login("ana@softgroup.com");
        mvc.perform(get("/api/usuarios/me/colegas").session(session))
            .andExpect(status().isOk());
    }

    @Test
    void colaboradorListaSuasEquipes() throws Exception {
        MockHttpSession session = login("ana@softgroup.com");
        mvc.perform(get("/api/equipes/minhas").session(session))
            .andExpect(status().isOk());
    }

    @Test
    void avaliacaoSemSessaoRetorna401() throws Exception {
        mvc.perform(post("/api/avaliacoes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"idAvaliado\":3,\"idSoftskill\":1,\"idCiclo\":2,\"nota\":80,\"tipo\":\"AUTO\"}"))
            .andExpect(status().isUnauthorized());
    }
}
