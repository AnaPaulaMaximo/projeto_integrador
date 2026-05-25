package com.softgroup.softgroup.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "equipe")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Equipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipe")
    private Integer idEquipe;

    @Column(name = "nome", nullable = false, length = 50)
    private String nome;

    @JsonIgnore
    @ManyToMany(mappedBy = "equipes", fetch = FetchType.LAZY)
    private Set<Usuario> usuarios = new HashSet<>();
}
