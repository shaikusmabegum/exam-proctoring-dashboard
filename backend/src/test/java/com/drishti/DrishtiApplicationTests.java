package com.drishti;

import com.drishti.repository.ExamAttemptRepository;
import com.drishti.repository.ExamRepository;
import com.drishti.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class DrishtiApplicationTests {

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private ExamRepository examRepository;

    @MockBean
    private ExamAttemptRepository examAttemptRepository;

    @Test
    void contextLoads() {
    }

}
