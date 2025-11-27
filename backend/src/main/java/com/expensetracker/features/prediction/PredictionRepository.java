package com.expensetracker.features.prediction;

import com.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByUser(User user);

    List<Prediction> findByUserOrderByPredictionDateDesc(User user);
}
