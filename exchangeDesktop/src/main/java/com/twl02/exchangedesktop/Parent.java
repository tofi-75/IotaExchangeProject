package com.twl02.exchangedesktop;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.ResourceBundle;
public class Parent implements Initializable, OnPageCompleteListener{
    public BorderPane borderPane;
    public Button transactionButton;
    public Button loginButton;
    public Button registerButton;
    public Button logoutButton;
    public Button pendingRequestsButton;
    public Button offersButton;
    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        updateNavigation();
    }
    public void ratesSelected() {
        swapContent(Section.RATES);
    }
    public void transactionsSelected() {
        swapContent(Section.TRANSACTIONS);
    }
    public void loginSelected() {
        swapContent(Section.LOGIN);
    }
    public void registerSelected() {
        swapContent(Section.REGISTER);
    }
    public void pendingRequestsSelected(){swapContent(Section.PENDING_REQUESTS);}
    public void offersSelected() {swapContent(Section.OFFERS);}
    boolean isTeller;
    public void logoutSelected() {
        Authentication.getInstance().deleteToken();
        swapContent(Section.RATES);
    }
    private void swapContent(Section section) {
        try {
            URL url = getClass().getResource(section.getResource());
            FXMLLoader loader = new FXMLLoader(url);
            borderPane.setCenter(loader.load());
            if (section.doesComplete()) {
                ((PageCompleter)
                        loader.getController()).setOnPageCompleteListener(this);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        updateNavigation();
    }

    private void updateNavigation() {
        if(isAuthenticated()) {
            isTeller = isTeller();
        }
        transactionButton.setManaged(isAuthenticated() && isTeller());
        transactionButton.setVisible(isAuthenticated() && isTeller());
        loginButton.setManaged(!isAuthenticated());
        loginButton.setVisible(!isAuthenticated());
        registerButton.setManaged(!isAuthenticated());
        registerButton.setVisible(!isAuthenticated());
        logoutButton.setManaged(isAuthenticated());
        logoutButton.setVisible(isAuthenticated());
        pendingRequestsButton.setManaged(isAuthenticated());
        pendingRequestsButton.setVisible(isAuthenticated());
        offersButton.setManaged(isAuthenticated() && isTeller());
        offersButton.setVisible(isAuthenticated() && isTeller());

    }

    public static boolean isAuthenticated() {
        boolean authenticated = Authentication.getInstance().getToken() !=
                null;
        return authenticated;
    }

    public static boolean isTeller() {
        //Code to check if Teller
        String[] chunks = Authentication.getInstance().getToken().split("\\.");
        Base64.Decoder decoder = Base64.getUrlDecoder();

        String header = new String(decoder.decode(chunks[0]));
        String payload = new String(decoder.decode(chunks[1]));


        String userDetailsBytesToStrings = new String(
                decoder.decode(chunks[1]), StandardCharsets.UTF_8);
        JsonParser jsonParser = new JsonParser();


        JsonObject jsonObjectOutput
                = (JsonObject)jsonParser.parse(
                userDetailsBytesToStrings);

        boolean isTeller = jsonObjectOutput.get("is_teller").toString().equals("true");
        return isTeller;
    }


    @Override
    public void onPageCompleted() {
        swapContent(Section.RATES);
    }


    private enum Section {
        RATES,
        TRANSACTIONS,
        LOGIN,
        REGISTER,
        PENDING_REQUESTS,
        OFFERS;

        public String getResource() {
            return switch (this) {
                case RATES ->
                        "/com/twl02/exchangedesktop/rates/rates.fxml";
                case TRANSACTIONS ->
                        "/com/twl02/exchangedesktop/transactions/transactions.fxml";
                case LOGIN ->
                        "/com/twl02/exchangedesktop/login/login.fxml";
                case REGISTER ->
                        "/com/twl02/exchangedesktop/register/register.fxml";
                case PENDING_REQUESTS ->
                        "/com/twl02/exchangedesktop/pending_requests/pending_requests.fxml";
                case OFFERS ->
                        "/com/twl02/exchangedesktop/offers/offers.fxml";
                default -> null;
            };
        }

        public boolean doesComplete() {
            return switch (this) {
                case LOGIN, REGISTER -> true;
                default -> false;
            };
        }

    }
}