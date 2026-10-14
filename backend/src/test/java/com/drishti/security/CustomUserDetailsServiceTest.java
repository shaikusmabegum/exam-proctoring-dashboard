package com.drishti.security;

import com.drishti.entity.Role;
import com.drishti.entity.User;
import com.drishti.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    private CustomUserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        userDetailsService = new CustomUserDetailsService(userRepository);
    }

    @Test
    @DisplayName("Should load user by normalized email successfully")
    void testLoadUserByUsername_Success() {
        User user = new User("John Doe", "john@example.com", "hashed_pwd", Role.STUDENT);
        user.setId("id1");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = userDetailsService.loadUserByUsername(" JOHN@Example.Com ");

        assertNotNull(userDetails);
        assertEquals("john@example.com", userDetails.getUsername());
        assertTrue(userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT")));
        verify(userRepository).findByEmail("john@example.com");
    }

    @Test
    @DisplayName("Should throw UsernameNotFoundException when user is not found")
    void testLoadUserByUsername_NotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () ->
                userDetailsService.loadUserByUsername("unknown@example.com"));
    }
}
