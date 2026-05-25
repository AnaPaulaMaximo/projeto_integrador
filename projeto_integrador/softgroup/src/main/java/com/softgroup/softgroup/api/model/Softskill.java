package com.softgroup.softgroup.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidade que representa uma Softskill (habilidade comportamental).
 *
 * Exemplos: Comunicação, Trabalho em Equipe, Liderança, etc.
 */
@Entity
@Table(name = "softskill")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Softskill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_softskill")
    private Integer idSoftskill;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "descricao", nullable = false, columnDefinition = "TEXT") // TEXT = sem limite de caracteres
    private String descricao;
}
