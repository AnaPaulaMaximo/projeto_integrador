package com.softgroup.softgroup.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RankingItemDTO {

    private Integer posicao;
    private Integer idUsuario;
    private String nome;
    private String cargo;
    private Double mediaAuto;
    private Double mediaLider;
    private Double media360;
    private Double mediaGeral;
    private Long totalAvaliacoes;
    private String cor;    // AZUL | VERDE | AMARELO | VERMELHO
    private String nivel;  // nome do nível
}
