module com.twl02.exchangedesktop {
    requires javafx.controls;
    requires javafx.fxml;

    requires retrofit2;
    requires java.sql;
    requires gson;
    requires retrofit2.converter.gson;
    requires java.prefs;

    opens com.twl02.exchangedesktop.api.model to javafx.base, gson;
    opens com.twl02.exchangedesktop.login to javafx.fxml;
    opens com.twl02.exchangedesktop.register to javafx.fxml;
    opens com.twl02.exchangedesktop.transactions to javafx.fxml;
    opens com.twl02.exchangedesktop.pending_requests to javafx.fxml;
    opens com.twl02.exchangedesktop.new_request to javafx.fxml;
    opens com.twl02.exchangedesktop.offers to javafx.fxml;
    opens com.twl02.exchangedesktop.new_offer to javafx.fxml;

    opens com.twl02.exchangedesktop to javafx.fxml;
    exports com.twl02.exchangedesktop;
    exports com.twl02.exchangedesktop.rates;
    opens com.twl02.exchangedesktop.rates to javafx.fxml;
}