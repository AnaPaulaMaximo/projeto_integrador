package com.softgroup.softgroup.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ColaboradorPendenteDTO {

    private Integer idUsuario;
    private String nome;
    private String email;
}
