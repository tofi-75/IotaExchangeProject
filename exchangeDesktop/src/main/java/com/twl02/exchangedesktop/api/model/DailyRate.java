package com.twl02.exchangedesktop.api.model;

import com.google.gson.annotations.SerializedName;

import java.util.Date;

public class DailyRate {
    @SerializedName("buy_usd_max")
    public Float buyUsdMax;
    @SerializedName("buy_usd_min")
    public Float buyUsdMin;
    @SerializedName("buy_usd_avg")
    public Float buyUsdAvg;
    @SerializedName("sell_usd_max")
    public Float sellUsdMax;
    @SerializedName("sell_usd_min")
    public Float sellUsdMin;
    @SerializedName("sell_usd_avg")
    public Float sellUsdAvg;
    @SerializedName("num_sell_transactions")
    public Float numSellTransactions;
    @SerializedName("num_buy_transactions")
    public Float numBuyTransactions;
    @SerializedName("id")
    public Integer id;
    @SerializedName("day")
    public Date day;

    public DailyRate(Float buyUsdAvg, Float sellUsdAvg, Date day) {
        this.buyUsdAvg = buyUsdAvg;
        this.sellUsdAvg = sellUsdAvg;
        this.day = day;
    }

    public DailyRate(Float buyUsdMax, Float buyUsdMin, Float buyUsdAvg, Float sellUsdAvg, Date day) {
        this.buyUsdMax = buyUsdMax;
        this.buyUsdMin = buyUsdMin;
        this.buyUsdAvg = buyUsdAvg;
        this.sellUsdAvg = sellUsdAvg;
        this.day = day;
    }

    public Float getBuyUsdMax() {
        return buyUsdMax;
    }

    public Float getBuyUsdMin() {
        return buyUsdMin;
    }

    public Float getBuyUsdAvg() {
        return buyUsdAvg;
    }

    public Float getSellUsdMax() {
        return sellUsdMax;
    }

    public Float getSellUsdMin() {
        return sellUsdMin;
    }

    public Float getSellUsdAvg() {
        return sellUsdAvg;
    }

    public Float getNumSellTransactions() {
        return numSellTransactions;
    }

    public Float getNumBuyTransactions() {
        return numBuyTransactions;
    }

    public Date getDay() {
        return day;
    }

    public Integer getId() {
        return id;
    }


}
