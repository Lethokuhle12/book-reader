package com.bookReader.backend.service;

import com.bookReader.backend.dto.ExplanationRequest;
import com.bookReader.backend.dto.ExplanationResponse;

public interface AiExplanationService {

    ExplanationResponse explainTerm(ExplanationRequest request);
}
