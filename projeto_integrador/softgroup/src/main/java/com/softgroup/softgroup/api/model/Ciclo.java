package com.softgroup.softgroup.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Entidade que representa um Ciclo de avaliação.
 *
 * Um ciclo é um período (ex: "1º Trimestre 2026") durante o qual
 * as avaliações são feitas. Cada ciclo tem data de início e fim,
 * e pode estar ABERTO (aceitando avaliações) ou FECHADO.
 */
@Entity
@Table(name = "ciclo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ciclo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ciclo")
    private Integer idCiclo;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // ABERTO | FECHADO
}
