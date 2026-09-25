package com.bookReader.backend.dto;

public class ExplanationRequest {

    private String text;
    private String context;
    private String bookTitle;

    public ExplanationRequest() {
    }

    public ExplanationRequest(String text, String context, String bookTitle) {
        this.text = text;
        this.context = context;
        this.bookTitle = bookTitle;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }
}
