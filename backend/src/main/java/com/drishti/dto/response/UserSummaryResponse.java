package com.drishti.dto.response;

import com.drishti.entity.Role;
import com.drishti.entity.User;

import java.time.Instant;

public class UserSummaryResponse {

    private String id;
    private String fullName;
    private String email;
    private Role role;
    private boolean active;
    private boolean approved;
    private boolean emailVerified;
    private Instant createdAt;
    private Instant lastLoginAt;

    public UserSummaryResponse() {
    }

    public UserSummaryResponse(String id, String fullName, String email, Role role, boolean active, boolean emailVerified, Instant createdAt, Instant lastLoginAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.active = active;
        this.approved = active;
        this.emailVerified = emailVerified;
        this.createdAt = createdAt;
        this.lastLoginAt = lastLoginAt;
    }

    public UserSummaryResponse(String id, String fullName, String email, Role role, boolean active, boolean approved, boolean emailVerified, Instant createdAt, Instant lastLoginAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.active = active;
        this.approved = approved;
        this.emailVerified = emailVerified;
        this.createdAt = createdAt;
        this.lastLoginAt = lastLoginAt;
    }

    public static UserSummaryResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }
        UserSummaryResponse response = new UserSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.isEmailVerified(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
        response.setApproved(user.isApproved());
        return response;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
}
