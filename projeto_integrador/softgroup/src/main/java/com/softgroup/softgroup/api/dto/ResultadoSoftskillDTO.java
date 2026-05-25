package com.softgroup.softgroup.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoSoftskillDTO {

    private Integer idSoftskill;
    private String nomeSoftskill;
    private String tipo;          // AUTO | LIDER | 360
    private Double media;
    private Long total;
    private String cor;           // AZUL | VERDE | AMARELO | VERMELHO
    private String nivel;         // "Acima da Expectativa", etc.
}
