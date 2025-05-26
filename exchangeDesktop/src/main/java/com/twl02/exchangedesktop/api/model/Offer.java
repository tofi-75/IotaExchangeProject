package com.twl02.exchangedesktop.api.model;

import com.google.gson.annotations.SerializedName;

import java.util.Date;
import java.util.List;

public class Offer {
    @SerializedName("id")
    public Integer id;
    @SerializedName("amount")
    public Double amount;
    @SerializedName("transaction_id")
    public Integer transcationId;
    @SerializedName("teller_id")
    public Integer tellerId;
    @SerializedName("added_date")
    public String addedDate;

    public Integer getId() {
        return id;
    }

    public Double getAmount() {
        return amount;
    }

    public Integer getTranscationId() {
        return transcationId;
    }

    public Integer getTellerId() {
        return tellerId;
    }

    public String getAddedDate() {
        return addedDate;
    }

    public Offer(Double amount, Integer transcationId) {
        this.amount = amount;
        this.transcationId = transcationId;
    }
}
