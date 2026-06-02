package com.softgroup.softgroup.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidade que define os Níveis de Avaliação e suas faixas.
 *
 * Cada nível tem uma faixa de notas (ex: 80-100) e uma cor associada.
 * Serve para classificar a nota de um colaborador em uma categoria visual.
 *
 * Exemplos:
 *   - "Acima da Expectativa"  → 80 a 100 → AZUL
 *   - "Dentro da Expectativa" → 60 a 79  → VERDE
 *   - "Em Desenvolvimento"    → 40 a 59  → AMARELO
 *   - "Abaixo da Expectativa" → 0  a 39  → VERMELHO
 */
@Entity
@Table(name = "nivel_avaliacao")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NivelAvaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_nivelavaliacao")
    private Integer idNivelAvaliacao;

    @Column(name = "nome", nullable = false, length = 50)
    private String nome; // Ex: "Acima da Expectativa"

    @Column(name = "cor", nullable = false, length = 20)
    private String cor; // AZUL | VERDE | AMARELO | VERMELHO

    @Column(name = "faixa_min", nullable = false)
    private Integer faixaMin; // nota mínima da faixa

    @Column(name = "faixa_max", nullable = false)
    private Integer faixaMax; // nota máxima da faixa
}
