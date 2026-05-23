package com.softgroup.softgroup.api.repository;

import com.softgroup.softgroup.api.model.Softskill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/** Repository de Softskill — lista todas as habilidades ordenadas por nome. */
@Repository
public interface SoftskillRepository extends JpaRepository<Softskill, Integer> {

    List<Softskill> findAllByOrderByNome();
}
