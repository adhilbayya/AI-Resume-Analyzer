package com.example.demo.controller;

import com.example.demo.service.SkillMatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/resume")
public class ResumeAnalysisController {
    private final SkillMatchService skillMatchService;

    public ResumeAnalysisController(SkillMatchService skillMatchService){
        this.skillMatchService = skillMatchService;
    }

    @PostMapping("/analyse")
    public ResponseEntity<Map<String, Object>> analyseResume(@RequestParam String role, @RequestParam String resumeText){
        System.out.println(role);
        System.out.println(resumeText);
        Map<String, Object> result = skillMatchService.analyse(role, resumeText);
        return ResponseEntity.ok(result);
    }
}
