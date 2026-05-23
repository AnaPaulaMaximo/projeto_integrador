package com.softgroup.softgroup.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {

    // Resumo geral do colaborador no ciclo
    private Integer idUsuario;
    private String nomeUsuario;
    private Integer idCiclo;
    private String nomeCiclo;
    private Double mediaGeral;
    private String corGeral;
    private String nivelGeral;

    // Resultados por softskill (autoavaliação, líder, 360)
    private List<ResultadoSoftskillDTO> resultadosPorSoftskill;

    // Histórico de ciclos anteriores
    private List<HistoricoItemDTO> historico;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoricoItemDTO {
        private Integer idCiclo;
        private String nomeCiclo;
        private String dataInicio;
        private Double mediaGeral;
        private String cor;
    }
}
