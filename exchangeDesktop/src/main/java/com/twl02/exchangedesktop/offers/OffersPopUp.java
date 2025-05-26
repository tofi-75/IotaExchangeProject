package com.twl02.exchangedesktop.offers;

import com.twl02.exchangedesktop.Authentication;
import com.twl02.exchangedesktop.Main;
import com.twl02.exchangedesktop.Parent;
import com.twl02.exchangedesktop.api.ExchangeService;
import com.twl02.exchangedesktop.api.model.*;
import com.twl02.exchangedesktop.new_request.NewRequest;
import com.twl02.exchangedesktop.pending_requests.PendingRequests;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
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

public class OffersPopUp implements Initializable {
    public TableView popupTableView;
    public TableColumn popupAmountColumn;
    public TableColumn popupOfferDateColumn;
    public TableColumn popupAcceptButtonColumn;
    public TableColumn popupDeleteButtonColumn;
    public static Stage popupNewOfferStage;


    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        popupAmountColumn.setCellValueFactory(new
                PropertyValueFactory<Offer, Long>("amount"));
        popupOfferDateColumn.setCellValueFactory(
                new PropertyValueFactory<Offer,String>("addedDate"));

        ExchangeService.exchangeApi().getOffers(PendingRequests.requestIdToDisplay,"Bearer " +
                        Authentication.getInstance().getToken())
                .enqueue(new Callback<TransactionRequest>() {
                             @Override
                             public void onResponse(Call<TransactionRequest> call,
                                                    Response<TransactionRequest> response) {

                                 popupTableView.getItems().setAll(FXCollections.observableArrayList(response.body().getOffers()));
                             }
                             @Override
                             public void onFailure(Call<TransactionRequest> call,
                                                   Throwable throwable) {
                                 System.out.println(throwable);
                             }
                });
        if(!Parent.isTeller()) {
            popupAcceptButtonColumn.setVisible(true);
            popupDeleteButtonColumn.setVisible(true);
//            addDeleteButton();
        }else{
            popupAcceptButtonColumn.setVisible(false);
            popupDeleteButtonColumn.setVisible(false);
        }

        popupAcceptButtonColumn.setCellFactory(param -> new TableCell<Offer,Void>() {
            private final Button acceptButton = new Button("Accept");
            {acceptButton.setOnAction(new EventHandler<ActionEvent>() {
                @Override
                public void handle(ActionEvent actionEvent) {
                    acceptOffer(getTableRow().getItem().getId());
                }
            });}
            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    setGraphic(acceptButton);
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

    public void acceptOffer(Integer offerId){
        ExchangeService.exchangeApi().acceptOffer(new OfferId(offerId), "Bearer " +
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

    public void deleteOffer(Integer offerId){
        ExchangeService.exchangeApi().rejectOffer(new OfferId(offerId), "Bearer " +
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


    public void showNewOfferPopup(ActionEvent actionEvent) throws IOException {
        popupNewOfferStage = new Stage();
        popupNewOfferStage.initModality(Modality.APPLICATION_MODAL);

        AnchorPane popupPane = FXMLLoader.load(NewRequest.class.getResource("/com/twl02/exchangedesktop/new_offer/new_offer.fxml"));
        popupNewOfferStage.getIcons().add(new Image(Main.class.getResourceAsStream("/sarref-high-resolution-color-logo.png")));
        popupNewOfferStage.setTitle("Add offer");
        Scene popupScene = new Scene(popupPane);
        popupNewOfferStage.setMaxHeight(250);
        popupNewOfferStage.setMaxWidth(312);
        popupNewOfferStage.setMinHeight(250);
        popupNewOfferStage.setMinWidth(312);
        popupNewOfferStage.setScene(popupScene);
        popupNewOfferStage.show();
    }

    public static void closeNewOfferPopup(){
        popupNewOfferStage.close();
    }

}
