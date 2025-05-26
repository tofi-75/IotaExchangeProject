package com.twl02.exchangedesktop.api.model;

import com.google.gson.annotations.SerializedName;

public class OfferId  {
    @SerializedName("offer_id")
    public Integer offerId;

    public OfferId(Integer offerId) {
        this.offerId = offerId;
    }
}
