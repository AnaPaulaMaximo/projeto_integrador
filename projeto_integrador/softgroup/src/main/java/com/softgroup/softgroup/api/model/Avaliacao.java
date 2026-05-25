package com.softgroup.softgroup.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "avaliacao")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_avaliacao")
    private Integer idAvaliacao;

    @Column(name = "id_avaliador", nullable = false)
    private Integer idAvaliador;

    @Column(name = "id_avaliado", nullable = false)
    private Integer idAvaliado;

    @Column(name = "id_softskill", nullable = false)
    private Integer idSoftskill;

    @Column(name = "id_ciclo", nullable = false)
    private Integer idCiclo;

    @Column(name = "nota", nullable = false)
    private Integer nota;

    @Column(name = "tipo", nullable = false, length = 20)
    private String tipo;

    @Column(name = "anonimato")
    private Boolean anonimato = false;

    @Column(name = "data")
    private LocalDateTime data;
}
