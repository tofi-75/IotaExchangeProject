package com.twl02.exchangedesktop.api.model;

import com.google.gson.annotations.SerializedName;

public class User {
    @SerializedName("id")
    Integer id;
    @SerializedName("username")
    String username;
    @SerializedName("password")
    String password;

    @SerializedName("is_teller")
    Boolean isTeller;
    public User(String username, String password, Boolean isTeller) {
        this.username = username;
        this.password = password;
        this.isTeller = isTeller;
    }
    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

}
