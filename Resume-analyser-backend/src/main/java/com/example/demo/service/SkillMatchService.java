package com.example.demo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;

@Service
public class SkillMatchService {
    private final Map<String, List<String>> skillData;

    public SkillMatchService() throws Exception{
        ObjectMapper mapper = new ObjectMapper();
        InputStream is = new ClassPathResource("skills.json").getInputStream();
        Map<String, List<String>> originalData = mapper.readValue(is, new TypeReference<>() {});

        skillData = new HashMap<>();
        for (Map.Entry<String, List<String>> entry : originalData.entrySet()) {
            skillData.put(entry.getKey().toLowerCase(), entry.getValue());
        }
    }

    public Map<String, Object> analyse(String role, String resumeText){
        role = role.toLowerCase();
        List<String> expectedSkills = skillData.getOrDefault(role, new ArrayList<>());

        List<String> found = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for(String skill : expectedSkills){
            if(resumeText.toLowerCase().contains(skill.toLowerCase())){
                found.add(skill);
            }else{
                missing.add(skill);
            }
        }
        double matchPercent = expectedSkills.isEmpty() ? 0 : (double) found.size() / expectedSkills.size() * 100;
        Map<String, Object> result = new HashMap<>();
        result.put("role", role);
        result.put("skills_found", found);
        result.put("skills_missing", missing);
        result.put("match_percent", matchPercent);

        return result;
    }
}
