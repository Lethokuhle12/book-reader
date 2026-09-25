package com.bookReader.backend.dto;

public class ExplanationResponse {

    private String term;
    private String definition;
    private String contextualMeaning;
    private String example;
    private String pronunciation;

    public ExplanationResponse() {
    }

    public ExplanationResponse(String term, String definition, String contextualMeaning, String example, String pronunciation) {
        this.term = term;
        this.definition = definition;
        this.contextualMeaning = contextualMeaning;
        this.example = example;
        this.pronunciation = pronunciation;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }

    public String getContextualMeaning() {
        return contextualMeaning;
    }

    public void setContextualMeaning(String contextualMeaning) {
        this.contextualMeaning = contextualMeaning;
    }

    public String getExample() {
        return example;
    }

    public void setExample(String example) {
        this.example = example;
    }

    public String getPronunciation() {
        return pronunciation;
    }

    public void setPronunciation(String pronunciation) {
        this.pronunciation = pronunciation;
    }
}
