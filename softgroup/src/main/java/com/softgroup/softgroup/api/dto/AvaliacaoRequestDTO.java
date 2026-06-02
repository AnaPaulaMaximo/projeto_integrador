package com.softgroup.softgroup.api.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AvaliacaoRequestDTO {

    @NotNull(message = "ID do avaliado é obrigatório")
    private Integer idAvaliado;

    @NotNull(message = "ID da softskill é obrigatório")
    private Integer idSoftskill;

    @NotNull(message = "ID do ciclo é obrigatório")
    private Integer idCiclo;

    @NotNull(message = "Nota é obrigatória")
    @Min(value = 0, message = "Nota mínima é 0")
    @Max(value = 100, message = "Nota máxima é 100")
    private Integer nota;

    @NotBlank(message = "Tipo é obrigatório")
    @Pattern(regexp = "AUTO|LIDER|360", message = "Tipo deve ser AUTO, LIDER ou 360")
    private String tipo;

    private Boolean anonimato = false;
}
