package com.twl02.exchangedesktop.offers;

import com.twl02.exchangedesktop.Authentication;
import com.twl02.exchangedesktop.api.ExchangeService;
import com.twl02.exchangedesktop.api.model.Offer;
import com.twl02.exchangedesktop.api.model.OfferId;
import com.twl02.exchangedesktop.api.model.Transaction;
import com.twl02.exchangedesktop.api.model.TransactionRequest;
import com.twl02.exchangedesktop.pending_requests.PendingRequests;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.ResourceBundle;

public class Offers implements Initializable {
    public TableView popupTableView;
    public TableColumn popupAmountColumn;
    public TableColumn popupRequestDateColumn;
    public TableColumn popupViewOffersButtonColumn;
    public TableColumn popupDeleteButtonColumn;



    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        popupAmountColumn.setCellValueFactory(new
                PropertyValueFactory<Offer, Long>("amount"));
        popupRequestDateColumn.setCellValueFactory(new
                PropertyValueFactory<Offer, String>("addedDate"));
        ExchangeService.exchangeApi().getOffers("Bearer " +
                        Authentication.getInstance().getToken())
                .enqueue(new Callback<List<TransactionRequest>>() {
                    @Override
                    public void onResponse(Call<List<TransactionRequest>> call,
                                           Response<List<TransactionRequest>> response) {
                        List<Offer> offers = new ArrayList();
                        for (TransactionRequest transactionRequest : response.body()) {
                            offers.addAll(transactionRequest.getOffers());
                        }
                        popupTableView.getItems().setAll(offers);
                    }
                    @Override
                    public void onFailure(Call<List<TransactionRequest>> call,
                                          Throwable throwable) {
                        System.out.println(throwable);
                    }
                });
        popupViewOffersButtonColumn.setCellFactory(param -> new TableCell<Offer,Void>() {
            private final Button viewOffersButton = new Button("View Offers");
            {viewOffersButton.setOnAction(new EventHandler<ActionEvent>() {
                @Override
                public void handle(ActionEvent actionEvent) {
                    try {
                        viewOffers(getTableRow().getItem().getTranscationId());
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }
            });}
            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    setGraphic(viewOffersButton);
                }
            }


        });

        popupDeleteButtonColumn.setCellFactory(param -> new TableCell<Offer,Void>() {
            private final Button deleteButton = new Button("Delete");
            {deleteButton.setOnAction(new EventHandler<ActionEvent>() {
                @Override
                public void handle(ActionEvent actionEvent) {
                    deleteOffer(getTableRow().getItem().getId());
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


//        popupTableView.getItems().add(0,new Transaction(1F,2F, true));
    }

    private void viewOffers(Integer requestId) throws IOException {
        PendingRequests.showOffersPopup(requestId);
    }

    public void deleteOffer(Integer offerId){
        ExchangeService.exchangeApi().deleteOffer(offerId, "Bearer " +
            Authentication.getInstance().getToken()).enqueue(new
             Callback<TransactionRequest>() {

                 @Override
                 public void onResponse(Call<TransactionRequest> call, Response<TransactionRequest> response) {

                     Platform.runLater(() -> {
                         PendingRequests.closeOfferPopup();
                     });
                 }

                 @Override
                 public void onFailure(Call<TransactionRequest> call, Throwable
                         throwable) {
                 }
             });
    }




}
