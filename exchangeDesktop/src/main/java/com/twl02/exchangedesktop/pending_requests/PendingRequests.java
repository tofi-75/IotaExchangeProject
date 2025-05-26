package com.twl02.exchangedesktop.pending_requests;

import com.twl02.exchangedesktop.Authentication;
import com.twl02.exchangedesktop.Main;
import com.twl02.exchangedesktop.Parent;
import com.twl02.exchangedesktop.api.ExchangeService;
import com.twl02.exchangedesktop.api.model.Transaction;
import com.twl02.exchangedesktop.api.model.TransactionRequest;
import com.twl02.exchangedesktop.new_request.NewRequest;
import com.twl02.exchangedesktop.offers.OffersPopUp;
import javafx.beans.value.ObservableValue;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.image.Image;
import javafx.scene.layout.AnchorPane;
import javafx.stage.Modality;
import javafx.stage.Stage;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.io.IOException;
import java.net.URL;
import java.util.List;
import java.util.ResourceBundle;

public class PendingRequests implements Initializable {
    public TableView tableView;
    public TableColumn amount;
    public TableColumn usdToLbp;
    public TableColumn requestDate;
    public static Stage popupOfferStage;
    public static Stage popupNewReqStage;
    public Button newRequestButton;
    public TableColumn deleteRequestButtonColumn;
    public TableColumn numberOfOffers;

    public static Integer requestIdToDisplay;
    public Label helpMessage;

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        if(Parent.isTeller()){
            helpMessage.setText("Double-click to view and add offers");
        }else{
            helpMessage.setText("Double-click to view offers");

        }
        amount.setCellValueFactory(new
                PropertyValueFactory<TransactionRequest, Long>("amount"));
        usdToLbp.setCellValueFactory(new
                PropertyValueFactory<TransactionRequest, Boolean>("usdToLbp"));
        requestDate.setCellValueFactory(new
                PropertyValueFactory<TransactionRequest, String>("addedDate"));
        numberOfOffers.setCellValueFactory(new
                PropertyValueFactory<TransactionRequest, Long>("numOffers"));

//        amount.setCellValueFactory(transactionRequestNumberCellDataFeatures -> (ObservableValue<Number>) transactionRequestNumberCellDataFeatures.getValue().amount);
//        usdToLbp.setCellValueFactory(transactionRequestBooleanCellDataFeatures -> transactionRequestBooleanCellDataFeatures.getValue().usdToLbp);
//        requestDate.setCellValueFactory(transactionRequestStringCellDataFeatures -> transactionRequestStringCellDataFeatures.getValue().addedDate)


        ExchangeService.exchangeApi().getTransactionRequests("Bearer " +
                        Authentication.getInstance().getToken())
                .enqueue(new Callback<List<TransactionRequest>>() {
                    @Override
                    public void onResponse(Call<List<TransactionRequest>> call,
                                           Response<List<TransactionRequest>> response) {
//                        ObservableList<TransactionRequest> list = FXCollections.observableArrayList(response.body());


                        tableView.getItems().setAll(response.body());
                    }
                    @Override
                    public void onFailure(Call<List<TransactionRequest>> call,
                                          Throwable throwable) {
                        System.out.println(throwable);
                    }
                });

    if(!Parent.isTeller()) {
        deleteRequestButtonColumn.setVisible(true);
        newRequestButton.setVisible(true);
        addDeleteButton();
    }else{
        deleteRequestButtonColumn.setVisible(false);
        newRequestButton.setVisible(false);
    }
        // Add listener to handle click events on table rows
        tableView.setRowFactory(tv -> {
            TableRow<TransactionRequest> row = new TableRow<>();
            row.setOnMouseClicked(event -> {
                if (event.getClickCount() == 2 && !row.isEmpty()) {
                    TransactionRequest request = row.getItem();
                    try {
                        showOffersPopup(request.id);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }

                }
            });
            return row;
        });
    }

    private void addDeleteButton() {
        deleteRequestButtonColumn.setCellFactory(param -> new TableCell<TransactionRequest,Void>() {
            private final Button deleteButton = new Button("Delete");
            {deleteButton.setOnAction(new EventHandler<ActionEvent>() {
                @Override
                public void handle(ActionEvent actionEvent) {
                    TransactionRequest request = getTableRow().getItem();
                    System.out.println(request.id);
                    deleteRequest(request.id);
                }
            });}
            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    setGraphic(deleteButton);
                }
            }


        });
    }

    private void deleteRequest(Integer requestId) {
        String userToken = Authentication.getInstance().getToken();
        String authHeader = userToken != null ? "Bearer " + userToken : null;
        ExchangeService.exchangeApi().deleteTransactionRequest(requestId, authHeader).enqueue(new Callback<TransactionRequest>() {
            @Override
            public void onResponse(Call<TransactionRequest> call, Response<TransactionRequest> response) {
                System.out.println("deleted " + response.body().id);
            }

            @Override
            public void onFailure(Call<TransactionRequest> call, Throwable throwable) {

            }
        });
        System.out.println("Deleting " + requestId);


    }

    public static void showOffersPopup(Integer requestId) throws IOException {
        popupOfferStage = new Stage();
        popupOfferStage.initModality(Modality.APPLICATION_MODAL);
        requestIdToDisplay = requestId;
        AnchorPane popupPane = FXMLLoader.load(OffersPopUp.class.getResource("/com/twl02/exchangedesktop/offers/offers_popup.fxml"));
        popupOfferStage.getIcons().add(new Image(Main.class.getResourceAsStream("/sarref-high-resolution-color-logo.png")));
        popupOfferStage.setTitle("Offers");
        Scene popupScene = new Scene(popupPane);
        popupOfferStage.setScene(popupScene);
        popupOfferStage.show();
    }

    public static void closeOfferPopup(){
        if(popupOfferStage != null) {
            popupOfferStage.close();
        }
    }

    @FXML
    private void showNewRequestPopup() throws IOException {
        popupNewReqStage = new Stage();
        popupNewReqStage.initModality(Modality.APPLICATION_MODAL);

        AnchorPane popupPane = FXMLLoader.load(NewRequest.class.getResource("/com/twl02/exchangedesktop/new_request/new_request.fxml"));
        popupNewReqStage.getIcons().add(new Image(Main.class.getResourceAsStream("/sarref-high-resolution-color-logo.png")));
        popupNewReqStage.setTitle("Create Request");
        Scene popupScene = new Scene(popupPane);
        popupNewReqStage.setMaxHeight(250);
        popupNewReqStage.setMaxWidth(312);
        popupNewReqStage.setMinHeight(250);
        popupNewReqStage.setMinWidth(312);
        popupNewReqStage.setScene(popupScene);
        popupNewReqStage.show();
    }

    public static void closeNewRequestPopup(){
        popupNewReqStage.close();
    }

}
