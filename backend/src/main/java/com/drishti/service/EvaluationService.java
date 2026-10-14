package com.drishti.service;

import com.drishti.entity.Exam;
import com.drishti.entity.ExamAttempt;

public interface EvaluationService {

    /**
     * Evaluates a completed or auto-submitted exam attempt against authoritative exam questions.
     * Calculates marks, applies negative marking if configured, and updates evaluation status.
     *
     * @param attempt The exam attempt to evaluate
     * @param exam The authoritative exam definition
     * @return Evaluated ExamAttempt
     */
    ExamAttempt evaluateAttempt(ExamAttempt attempt, Exam exam);
}
