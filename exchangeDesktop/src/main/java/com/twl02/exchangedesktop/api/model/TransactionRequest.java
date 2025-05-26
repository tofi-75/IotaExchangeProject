package com.twl02.exchangedesktop.api.model;

import com.google.gson.annotations.SerializedName;
import com.twl02.exchangedesktop.offers.Offers;
import javafx.scene.control.ToggleGroup;

import java.util.Date;
import java.util.List;

public class TransactionRequest {
    @SerializedName("id")
    public Integer id;
    @SerializedName("amount")
    public Number amount;
    @SerializedName("usd_to_lbp")
    public Boolean usdToLbp;
    @SerializedName("user_id")
    public Integer userId;
    @SerializedName("num_offers")
    public Integer numOffers;
    @SerializedName("added_date")
    public String addedDate;
    @SerializedName("offers")
    public List<Offer> offers;

    public TransactionRequest(Number amount, Boolean usdToLbp) {
        this.amount = amount;
        this.usdToLbp = usdToLbp;
    }

    public Integer getId() {
        return id;
    }

    public Number getAmount() {
        return amount;
    }

    public Boolean getUsdToLbp() {
        return usdToLbp;
    }

    public Integer getUserId() {
        return userId;
    }

    public Integer getNumOffers() {
        return numOffers;
    }

    public String getAddedDate() {
        return addedDate;
    }

    public List<Offer> getOffers() {
        return offers;
    }
}
