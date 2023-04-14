package com.twl02.exchangedesktop.rates;

import com.twl02.exchangedesktop.Authentication;
import com.twl02.exchangedesktop.api.ExchangeService;
import com.twl02.exchangedesktop.api.model.ExchangeRates;
import com.twl02.exchangedesktop.api.model.Transaction;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.scene.control.Label;
import javafx.scene.control.RadioButton;
import javafx.scene.control.TextField;
import javafx.scene.control.ToggleGroup;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class Rates {
    public Label buyUsdRateLabel;
    public Label sellUsdRateLabel;
    public TextField lbpTextField;
    public TextField usdTextField;
    public TextField lbpTextFieldCalc;
    public TextField usdTextFieldCalc;
    public ToggleGroup transactionTypeCalc;
    public Label errorMessage;
    public ToggleGroup transactionType;
    public void initialize() {
        fetchRates();
    }
    private void fetchRates() {

            ExchangeService.exchangeApi().getExchangeRates().enqueue(new
                 Callback<ExchangeRates>() {
                     @Override
                     public void onResponse(Call<ExchangeRates> call,
                                            Response<ExchangeRates> response) {
                         ExchangeRates exchangeRates = response.body();
                         Platform.runLater(() -> {
                            if(exchangeRates.lbpToUsd != null) {
                                buyUsdRateLabel.setText(exchangeRates.lbpToUsd.toString());
                            }
                            else{
                                buyUsdRateLabel.setText("Not Available");
                            }
                            if(exchangeRates.usdToLbp != null) {
                                sellUsdRateLabel.setText(exchangeRates.usdToLbp.toString());
                            }else{
                                sellUsdRateLabel.setText("Not Available");
                            }
                         });
                     }
                     @Override
                     public void onFailure(Call<ExchangeRates> call, Throwable
                             throwable) {
                     }
                 });


    }
    public void addTransaction(ActionEvent actionEvent) {
        String usdValue = usdTextField.getText();
        String lbpValue = lbpTextField.getText();
        //String transactionTypeValue = ((RadioButton)transactionType.getSelectedToggle()).getText();
        if(usdValue.isEmpty() || lbpValue.isEmpty()){
            errorMessage.setText("Make sure your inputs are filled");
        } else if(!usdValue.matches("[0-9]*\\.?[0-9]+" )  || !lbpValue.matches("[0-9]*\\.?[0-9]+" )) {
            errorMessage.setText("Make sure your inputs are numbers");
        } else if (transactionType.getSelectedToggle() == null){
            errorMessage.setText("Make sure you selected a transaction type");
        } else {

            Transaction transaction = new Transaction(

                    Float.parseFloat(usdValue),
                    Float.parseFloat(lbpValue),
                    ((RadioButton)transactionType.getSelectedToggle()).getText().equals("Sell USD")

            );

            String userToken = Authentication.getInstance().getToken();
            String authHeader = userToken != null ? "Bearer " + userToken : null;
            ExchangeService.exchangeApi().addTransaction(transaction, authHeader).enqueue(new Callback<Object>() {
                @Override
                public void onResponse(Call<Object> call, Response<Object>
                        response) {
                    fetchRates();
                    Platform.runLater(() -> {
                        usdTextField.setText("");
                        lbpTextField.setText("");
                        errorMessage.setText("");
                    });
                }

                @Override
                public void onFailure(Call<Object> call, Throwable throwable) {
                    errorMessage.setText("Something went wrong. Please try again later");
                }
            });
        }

    }

    public void calculateAmount(ActionEvent actionEvent) {

        if (transactionTypeCalc.getSelectedToggle() == null){
            errorMessage.setText("Make sure you selected a transaction type");
        }
        else if(!((RadioButton)transactionTypeCalc.getSelectedToggle()).getText().equals("LBP to USD")){
            String usdValue = usdTextFieldCalc.getText();
            if(usdValue.isEmpty()){
                errorMessage.setText("Make sure your inputs are filled");
            } else if(!usdValue.matches("[0-9]*\\.?[0-9]+" )) {
                errorMessage.setText("Make sure your inputs are numbers");
            } else{
                lbpTextFieldCalc.setText(String.valueOf(Float.parseFloat(usdValue)*Float.parseFloat(sellUsdRateLabel.getText())));
            }
        }else{
            String lbpValue = lbpTextFieldCalc.getText();
            if(lbpValue.isEmpty()){
                errorMessage.setText("Make sure your inputs are filled");
            } else if(!lbpValue.matches("[0-9]*\\.?[0-9]+" )) {
                errorMessage.setText("Make sure your inputs are numbers");
            } else {
                usdTextFieldCalc.setText(String.valueOf(Float.parseFloat(lbpValue)/Float.parseFloat(buyUsdRateLabel.getText())));

            }

        }
    }
}
