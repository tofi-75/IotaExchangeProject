package com.twl02.exchangedesktop.api;

import com.twl02.exchangedesktop.api.model.*;
import retrofit2.Call;
import retrofit2.http.*;

import java.util.List;

public interface Exchange {
    @POST("/user")
    Call<User> addUser(@Body User user);
    @POST("/user/authenticate")
    Call<Token> authenticate(@Body User user);
    @GET("/rates/current")
    Call<ExchangeRates> getExchangeRates();
    @POST("/transaction")
    Call<Object> addTransaction(@Body Transaction transaction,
                                                          @Header("Authorization") String authorization);
    @GET("/transaction")
    Call<List<Transaction>> getTransactions(@Header("Authorization")
                                            String authorization);

    @GET("/rates/history")
    Call<List<DailyRate>> getDailyRates(@Query("startDay") String startDay, @Query("endDay") String endDay);

    @GET("/offers")
    Call<TransactionRequest> getOffers(@Query("request-id") Integer requestId, @Header("Authorization") String authorization);
    @GET("/offers")
    Call<List<TransactionRequest>> getOffers( @Header("Authorization") String authorization);

    @POST("/offer")
    Call<Offer> newOffer(@Body Offer offer,
                                @Header("Authorization") String authorization);
    @DELETE("/offer")
    Call<TransactionRequest> deleteOffer(@Query("offer-id") Integer offerId,
                             @Header("Authorization") String authorization);

    @POST("/offer/accept")
    Call<TransactionRequest> acceptOffer(@Body OfferId offer_id,
                          @Header("Authorization") String authorization);
    @POST("/offer/reject")
    Call<TransactionRequest> rejectOffer(@Body OfferId offer_id,
                             @Header("Authorization") String authorization);
    @POST("/transaction-request")
    Call<TransactionRequest> newTransactionRequest(@Body TransactionRequest transactionRequest,
                             @Header("Authorization") String authorization);
    @DELETE("/transaction-request")
    Call<TransactionRequest> deleteTransactionRequest(@Query("request-id") Integer requestId,
                             @Header("Authorization") String authorization);
    @GET("/transaction-requests")
    Call<List<TransactionRequest>> getTransactionRequests(@Header("Authorization") String authorization);

}
