package com.example.demo.controller;

import com.example.demo.service.GPTService;
import com.example.demo.service.SkillMatchService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/resume")
public class ResumeController {
    private final SkillMatchService skillMatchService;

    public ResumeController(SkillMatchService skillMatchService) {
        this.skillMatchService = skillMatchService;
    }

    @Autowired
    private GPTService gptService;
    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file")MultipartFile file, @RequestParam("role") String role){
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid File. Please upload a PDF");
            }

            String contentType = file.getContentType();
            String extractedCode = "";

            if(contentType.equals("application/pdf")){
                extractedCode = extractTextFromPDF(file);
            }else if(contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")){
                extractedCode = extractTextFromDOCX(file);
            } else if (contentType.equals("text/plain")) {
                extractedCode = extractTextFromTEXT(file);
            } else{
                return ResponseEntity.badRequest().body("Unsupported file type");
            }

            Map<String, Object> result = skillMatchService.analyse(role, extractedCode);
            @SuppressWarnings("unchecked")
            java.util.List<String> skillsMissing = (java.util.List<String>) result.get("skills_missing");
            String aiFeedback = gptService.getAnalysis(role, extractedCode, skillsMissing);

            result.put("ai_feedback", aiFeedback);

            return ResponseEntity.ok(result);
        }catch(Exception e){
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    private String extractTextFromPDF(MultipartFile file) throws IOException{
        byte[] pdfBytes = file.getInputStream().readAllBytes();
        PDDocument doc = Loader.loadPDF(pdfBytes);
        PDFTextStripper textStripper = new PDFTextStripper();
        String text = textStripper.getText(doc);

        doc.close();
        return text;
    }

    private String extractTextFromDOCX(MultipartFile file) throws IOException{
        XWPFDocument doc = new XWPFDocument(file.getInputStream());
        XWPFWordExtractor extractor = new XWPFWordExtractor(doc);
        String text = extractor.getText();
        doc.close();
        return text;
    }

    private String extractTextFromTEXT(MultipartFile file) throws IOException{
        return new String(file.getBytes(), StandardCharsets.UTF_8);
    }
}
