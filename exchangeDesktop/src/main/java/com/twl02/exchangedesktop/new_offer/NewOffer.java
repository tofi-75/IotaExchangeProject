package com.twl02.exchangedesktop.new_offer;

import com.twl02.exchangedesktop.Authentication;
import com.twl02.exchangedesktop.api.ExchangeService;
import com.twl02.exchangedesktop.api.model.Offer;
import com.twl02.exchangedesktop.api.model.TransactionRequest;
import com.twl02.exchangedesktop.offers.OffersPopUp;
import com.twl02.exchangedesktop.pending_requests.PendingRequests;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.fxml.Initializable;
import javafx.scene.control.Label;
import javafx.scene.control.RadioButton;
import javafx.scene.control.TextField;
import javafx.scene.control.ToggleGroup;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.net.URL;
import java.util.ResourceBundle;

public class NewOffer  implements Initializable {


    public TextField amountInputField;
    public Label amountInputLabel;
    public ToggleGroup transactionType;

    public boolean isUpdating;
    public Label errorMessage;

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        amountInputField.textProperty().addListener((observable, oldValue, newValue) -> {
            System.out.println(newValue);
            System.out.println(oldValue);
            if (newValue.matches("\\d*\\.?\\d*")) {
                amountInputField.setText(newValue);
            }else{
                amountInputField.setText(oldValue);

            }
        });

    }

    public void createOffer(ActionEvent actionEvent) {
        String amount = amountInputField.getText();

        if(amount.isEmpty()){
               errorMessage.setText("Make sure your inputs are filled");
        } else {

            System.out.println("We're in the createOffer button");
            Offer offer = new Offer(Double.parseDouble(amount), PendingRequests.requestIdToDisplay) ;

            String userToken = Authentication.getInstance().getToken();
            String authHeader = userToken != null ? "Bearer " + userToken : null;

            ExchangeService.exchangeApi().newOffer(offer, authHeader).enqueue(new Callback<Offer>() {
                @Override
                public void onResponse(Call<Offer> call, Response<Offer>
                        response) {
                    Platform.runLater(OffersPopUp::closeNewOfferPopup);

                }

                @Override
                public void onFailure(Call<Offer> call, Throwable throwable) {
                    System.out.println(throwable);
                }
            });
        }
    }

    public void changeLabel(ActionEvent actionEvent) {
        System.out.println(((RadioButton) transactionType.getSelectedToggle()).getText());
        if(((RadioButton)transactionType.getSelectedToggle()).getText().equals("Buy LBP")){
            amountInputLabel.setText("Amount in USD");
        }else{
            amountInputLabel.setText("Amount in LBP");
        }
    }
}
