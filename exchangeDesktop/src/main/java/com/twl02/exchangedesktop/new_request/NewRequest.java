package com.twl02.exchangedesktop.new_request;

import com.twl02.exchangedesktop.Authentication;
import com.twl02.exchangedesktop.api.ExchangeService;
import com.twl02.exchangedesktop.api.model.Transaction;
import com.twl02.exchangedesktop.api.model.TransactionRequest;
import com.twl02.exchangedesktop.pending_requests.PendingRequests;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.net.URL;
import java.util.ResourceBundle;

public class NewRequest implements Initializable {


     public TextField amountInputField;
     public Label amountInputLabel;
     public ToggleGroup transactionType;

     public boolean isUpdating;

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

     public void createRequest(ActionEvent actionEvent) {
          String amount = amountInputField.getText();

          if(amount.isEmpty()){
//               errorMessage.setText("Make sure your inputs are filled");
          } else if(!amount.matches("[0-9]*\\.?[0-9]+" )) {
//               errorMessage.setText("Make sure your inputs are numbers");
          } else if (transactionType.getSelectedToggle() == null){
//               errorMessage.setText("Make sure you selected a transaction type");
          } else {


          TransactionRequest transactionRequest = new TransactionRequest(Float.parseFloat(amount), ((RadioButton)transactionType.getSelectedToggle()).getText().equals("Buy USD")) ;

               String userToken = Authentication.getInstance().getToken();
               String authHeader = userToken != null ? "Bearer " + userToken : null;

          ExchangeService.exchangeApi().newTransactionRequest(transactionRequest, authHeader).enqueue(new Callback<TransactionRequest>() {
               @Override
               public void onResponse(Call<TransactionRequest> call, Response<TransactionRequest>
                       response) {
                    System.out.println(response.body());
                    Platform.runLater(PendingRequests::closeNewRequestPopup);

               }

               @Override
               public void onFailure(Call<TransactionRequest> call, Throwable throwable) {

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
