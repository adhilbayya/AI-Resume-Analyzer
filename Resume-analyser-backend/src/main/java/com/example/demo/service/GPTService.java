package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class GPTService {
    private static final Logger logger = LoggerFactory.getLogger(GPTService.class);
    private final WebClient webClient;
    private final String apiKey;

    public GPTService(WebClient.Builder webClientBuilder, @Value("${cohere.api.key}") String apiKey){
        this.apiKey = apiKey;
        this.webClient = webClientBuilder
                .baseUrl("https://api.cohere.ai/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
        if (apiKey.isEmpty() || apiKey.equals("${COHERE_API_KEY}")) {
            logger.error("Cohere API key is missing or not configured in application.properties");
        } else {
            logger.info("Cohere API key configured successfully");
        }
    }

    public String getAnalysis(String role, String resumeText, java.util.List<String> skillsMissing) throws Exception{
        if (apiKey.isEmpty() || apiKey.equals("${COHERE_API_KEY}")) {
            logger.error("Cannot make API call: API key is missing");
            return "Error: Cohere API key is not configured. Please check application.properties.";
        }

        String truncatedResume = resumeText.length() > 1000 ? resumeText.substring(0, 1000) + "..." : resumeText;

        String prompt = """
You are an expert HR assistant. The job role is: %s.
Here is the candidate's resume:

%s

The following skills are missing for this candidate: %s

Please provide a concise, well-organized summary with the following sections:
1. Matching Skills (max 3 bullet points, each max 15 words, use ✅)
2. Missing Skills (use only the provided missing skills, max 3 bullet points, each max 25 words, use ❌)
3. Suggestions to Improve (max 3 bullet points)


Do not exceed the specified number of bullet points per section. Keep each bullet point under 15 words. Do not add extra explanation after the last section.

Format your response with clear section headers and bullet points. Be brief but informative.
""".formatted(role, resumeText, String.join(", ", skillsMissing));

        Map<String, Object> requestBody = Map.of(
                "model", "command-nightly",
                "message", prompt,
                "temperature", 0.7,
                "max_tokens", 250
        );

        try {
            Map response = webClient.post()
                    .uri("/chat")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            Object text = response != null ? response.get("text") : null;
            if (text != null) {
                logger.info("Received response from Cohere chat API: {}", text);
                return text.toString();
            } else {
                logger.warn("No response from Cohere chat API");
                return "No response from Cohere.";
            }
        } catch (Exception e) {
            logger.error("Failed to get AI feedback from Cohere: {}", e.getMessage());
            return "Error contacting Cohere: " + e.getMessage();
        }
    }
}
