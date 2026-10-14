package com.drishti.repository;

import com.drishti.entity.Role;
import com.drishti.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Page<User> findByRole(Role role, Pageable pageable);

    Page<User> findByRoleAndActive(Role role, boolean active, Pageable pageable);

    Page<User> findByActive(boolean active, Pageable pageable);

    long countByRole(Role role);

    long countByActive(boolean active);
}
