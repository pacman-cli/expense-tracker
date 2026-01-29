package com.expensetracker.features.nudge;

import com.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NudgeRepository extends JpaRepository<Nudge, Long> {

    List<Nudge> findByUserOrderByCreatedAtDesc(User user);

    List<Nudge> findByUserAndIsReadOrderByCreatedAtDesc(User user, Boolean isRead);

    List<Nudge> findByUserAndTypeOrderByCreatedAtDesc(User user, Nudge.NudgeType type);

    Long countByUserAndIsRead(User user, Boolean isRead);

    void deleteByUser(User user);
}
